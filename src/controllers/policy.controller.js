const Policy = require('../models/Policy');

// @desc    Створити новий поліс
// @route   POST /api/policies
// @access  Private
exports.createPolicy = async (req, res) => {
  try {
    // Генерація номера полісу
    const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    req.body.policyNumber = policyNumber;

    // Якщо owner не вказано - беремо з JWT токену
    if (!req.body.owner) {
      req.body.owner = req.user._id;
    }

    const policy = await Policy.create(req.body);

    res.status(201).json({
      success: true,
      data: policy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати всі поліси
// @route   GET /api/policies
// @access  Private
exports.getAllPolicies = async (req, res) => {
  try {
    let query = {};

    // Фільтрація за власником для звичайних користувачів
    if (req.user.role === 'owner') {
      query.owner = req.user._id;
    }

    const policies = await Policy.find(query)
      .populate('pet', 'name species breed')
      .populate('owner', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати поліс за ID
// @route   GET /api/policies/:id
// @access  Private
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('pet', 'name species breed dateOfBirth')
      .populate('owner', 'firstName lastName email phone');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Поліс не знайдено'
      });
    }

    // Перевірка доступу
    if (policy.owner._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Доступ заборонено'
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Оновити поліс
// @route   PUT /api/policies/:id
// @access  Private/Agent/Admin
exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Поліс не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Скасувати поліс
// @route   DELETE /api/policies/:id
// @access  Private/Agent
exports.cancelPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Поліс не знайдено'
      });
    }

    policy.status = 'cancelled';
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Поліс скасовано',
      data: policy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
