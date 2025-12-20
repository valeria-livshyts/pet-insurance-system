const IoTData = require('../models/IoTData');
const Pet = require('../models/Pet');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

// Приймання даних від IoT пристрою
exports.receiveHealthData = async (req, res) => {
  try {
    const {
      deviceId,
      petId,
      timestamp,
      sensors,
      location,
      health,
      statistics
    } = req.body;

    // Валідація обов'язкових полів
    if (!deviceId || !sensors) {
      return res.status(400).json({
        success: false,
        message: 'Відсутні обов\'язкові поля: deviceId, sensors'
      });
    }

    // Перевірка існування тварини (опціонально для тестування)
    let pet = null;
    if (petId && petId.match(/^[0-9a-fA-F]{24}$/)) {
      pet = await Pet.findById(petId);
    }

    // Створення запису IoT даних
    const iotData = new IoTData({
      deviceId,
      pet: pet ? pet._id : null,
      timestamp: timestamp || Date.now(),
      sensors,
      location,
      health,
      statistics
    });

    await iotData.save();

    // Якщо статус критичний і є тварина - автоматично створюємо страховий випадок
    if (pet && health && health.status === 'critical') {
      await createAutomaticClaim(pet, iotData);
    }

    res.status(201).json({
      success: true,
      message: 'Дані успішно отримано',
      data: {
        id: iotData._id,
        timestamp: iotData.timestamp,
        healthStatus: health?.status || 'normal'
      }
    });

  } catch (error) {
    console.error('IoT Data Error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка збереження даних',
      error: error.message
    });
  }
};

// Автоматичне створення страхового випадку при критичному стані
async function createAutomaticClaim(pet, iotData) {
  try {
    // Перевіряємо чи є активний поліс
    const policy = await Policy.findOne({
      pet: pet._id,
      status: 'active'
    });

    if (!policy) {
      console.log('Активний поліс не знайдено для тварини:', pet.name);
      return;
    }

    // Перевіряємо чи немає вже відкритого випадку за останню годину
    const recentClaim = await Claim.findOne({
      pet: pet._id,
      status: { $in: ['pending', 'processing'] },
      createdAt: { $gte: new Date(Date.now() - 3600000) } // остання година
    });

    if (recentClaim) {
      console.log('Вже існує відкритий страховий випадок');
      return;
    }

    // Створюємо автоматичний страховий випадок
    const claim = new Claim({
      claimNumber: 'IOT-' + Date.now(),
      pet: pet._id,
      policy: policy._id,
      owner: pet.owner,
      incidentDate: new Date(),
      description: `Автоматичний страховий випадок від IoT пристрою.\n` +
        `Статус здоров\'я: ${iotData.health.status}\n` +
        `Індекс здоров\'я: ${iotData.health.healthIndex}/100\n` +
        `Попередження: ${iotData.health.alertMessage || 'Немає'}\n` +
        `Рекомендація: ${iotData.health.vetRecommendation}`,
      category: 'illness',
      status: 'pending',
      source: 'iot_device',
      iotDataRef: iotData._id
    });

    await claim.save();
    console.log('Створено автоматичний страховий випадок:', claim.claimNumber);

  } catch (error) {
    console.error('Помилка створення автоматичного страхового випадку:', error);
  }
}

// Отримання останніх даних моніторингу для тварини
exports.getLatestData = async (req, res) => {
  try {
    const { petId } = req.params;

    const latestData = await IoTData.getLatestByPet(petId);

    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'Дані моніторингу не знайдено'
      });
    }

    res.json({
      success: true,
      data: latestData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання даних',
      error: error.message
    });
  }
};

// Отримання історії моніторингу
exports.getHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 86400000); // За замовчуванням - остання доба
    const end = endDate ? new Date(endDate) : new Date();

    const history = await IoTData.find({
      pet: petId,
      timestamp: { $gte: start, $lte: end }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання історії',
      error: error.message
    });
  }
};

// Отримання критичних подій
exports.getCriticalEvents = async (req, res) => {
  try {
    const { petId } = req.params;
    const { limit = 50 } = req.query;

    const criticalEvents = await IoTData.find({
      pet: petId,
      'health.status': { $in: ['warning', 'critical'] }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: criticalEvents.length,
      data: criticalEvents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання критичних подій',
      error: error.message
    });
  }
};

// Отримання статистики здоров'я
exports.getHealthStatistics = async (req, res) => {
  try {
    const { petId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date(Date.now() - days * 86400000);

    const stats = await IoTData.aggregate([
      {
        $match: {
          pet: require('mongoose').Types.ObjectId(petId),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$sensors.temperature' },
          avgHeartRate: { $avg: '$sensors.heartRate' },
          avgActivity: { $avg: '$sensors.activityLevel' },
          avgHealthIndex: { $avg: '$health.healthIndex' },
          minTemperature: { $min: '$sensors.temperature' },
          maxTemperature: { $max: '$sensors.temperature' },
          minHeartRate: { $min: '$sensors.heartRate' },
          maxHeartRate: { $max: '$sensors.heartRate' },
          totalMeasurements: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$health.status', 'critical'] }, 1, 0] }
          },
          warningCount: {
            $sum: { $cond: [{ $eq: ['$health.status', 'warning'] }, 1, 0] }
          }
        }
      }
    ]);

    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: 'Немає даних для статистики'
      });
    }

    res.json({
      success: true,
      period: `${days} днів`,
      data: stats[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка розрахунку статистики',
      error: error.message
    });
  }
};

// Отримання даних для графіка
exports.getChartData = async (req, res) => {
  try {
    const { petId } = req.params;
    const { hours = 24, interval = 'hour' } = req.query;

    const startDate = new Date(Date.now() - hours * 3600000);

    let groupFormat;
    switch (interval) {
      case 'minute':
        groupFormat = { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$timestamp' } };
        break;
      case 'hour':
        groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } };
        break;
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } };
    }

    const chartData = await IoTData.aggregate([
      {
        $match: {
          pet: require('mongoose').Types.ObjectId(petId),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          avgTemperature: { $avg: '$sensors.temperature' },
          avgHeartRate: { $avg: '$sensors.heartRate' },
          avgActivity: { $avg: '$sensors.activityLevel' },
          avgHealthIndex: { $avg: '$health.healthIndex' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      interval,
      count: chartData.length,
      data: chartData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання даних графіка',
      error: error.message
    });
  }
};

// Отримання поточного місцезнаходження тварини
exports.getLocation = async (req, res) => {
  try {
    const { petId } = req.params;

    const latestData = await IoTData.findOne({
      pet: petId,
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true }
    }).sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'Дані про місцезнаходження не знайдено'
      });
    }

    res.json({
      success: true,
      data: {
        latitude: latestData.location.latitude,
        longitude: latestData.location.longitude,
        timestamp: latestData.timestamp,
        pet: latestData.pet
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання місцезнаходження',
      error: error.message
    });
  }
};
