const mongoose = require('mongoose');

const iotDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: false,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sensors: {
    temperature: {
      type: Number,
      required: true,
      min: 30,
      max: 45
    },
    heartRate: {
      type: Number,
      required: true,
      min: 20,
      max: 400
    },
    activityLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  health: {
    status: {
      type: String,
      enum: ['normal', 'warning', 'critical'],
      default: 'normal'
    },
    healthIndex: {
      type: Number,
      min: 0,
      max: 100
    },
    anomalyCount: {
      type: Number,
      default: 0
    },
    vetRecommendation: {
      type: String,
      enum: ['OK', 'MONITOR', 'CONSULT', 'URGENT']
    },
    alertMessage: {
      type: String
    }
  },
  statistics: {
    avgTemperature: Number,
    avgHeartRate: Number,
    avgActivity: Number,
    measurementCount: Number,
    totalAnomalies: Number
  }
}, {
  timestamps: true
});

// Індекси для швидкого пошуку
iotDataSchema.index({ pet: 1, timestamp: -1 });
iotDataSchema.index({ deviceId: 1, timestamp: -1 });
iotDataSchema.index({ 'health.status': 1 });

// Метод для отримання останніх даних по тварині
iotDataSchema.statics.getLatestByPet = async function(petId) {
  return this.findOne({ pet: petId }).sort({ timestamp: -1 });
};

// Метод для отримання історії за період
iotDataSchema.statics.getHistoryByPet = async function(petId, startDate, endDate) {
  return this.find({
    pet: petId,
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: -1 });
};

// Метод для отримання критичних подій
iotDataSchema.statics.getCriticalEvents = async function(petId) {
  return this.find({
    pet: petId,
    'health.status': { $in: ['warning', 'critical'] }
  }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('IoTData', iotDataSchema);
