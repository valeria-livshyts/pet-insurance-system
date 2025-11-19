const Clinic = require('../models/Clinic');

// @desc    Отримати всі клініки
// @route   GET /api/clinics
// @access  Public
exports.getAllClinics = async (req, res) => {
  try {
    const { city } = req.query;
    let query = { isActive: true };

    // Фільтрація за містом
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    const clinics = await Clinic.find(query);

    res.status(200).json({
      success: true,
      count: clinics.length,
      data: clinics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати клініку за ID
// @route   GET /api/clinics/:id
// @access  Public
exports.getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Клініку не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
