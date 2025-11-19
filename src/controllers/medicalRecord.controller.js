const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');

// @desc    Створити новий медичний запис
// @route   POST /api/medical-records
// @access  Private/Veterinarian
exports.createMedicalRecord = async (req, res) => {
  try {
    // Якщо veterinarian не вказано - беремо з JWT токену
    if (!req.body.veterinarian) {
      req.body.veterinarian = req.user._id;
    }

    const record = await MedicalRecord.create(req.body);

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати медичні записи тварини
// @route   GET /api/medical-records/pet/:petId
// @access  Private
exports.getPetMedicalRecords = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Тварину не знайдено'
      });
    }

    // Перевірка доступу
    if (pet.owner.toString() !== req.user._id.toString() &&
        req.user.role !== 'veterinarian') {
      return res.status(403).json({
        success: false,
        message: 'Доступ заборонено'
      });
    }

    const records = await MedicalRecord.find({ pet: req.params.petId })
      .populate('clinic', 'name')
      .populate('veterinarian', 'firstName lastName')
      .sort('-visitDate');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати медичний запис за ID
// @route   GET /api/medical-records/:id
// @access  Private
exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('pet', 'name species breed')
      .populate('clinic', 'name email phone')
      .populate('veterinarian', 'firstName lastName');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Медичний запис не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Оновити медичний запис
// @route   PUT /api/medical-records/:id
// @access  Private/Veterinarian
exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Медичний запис не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

