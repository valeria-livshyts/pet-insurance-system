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

// @desc    Продовжити поліс
// @route   POST /api/policies/:id/renew
// @access  Private
exports.renewPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Поліс не знайдено'
      });
    }

    // Перевірка доступу
    if (policy.owner.toString() !== req.user._id.toString() &&
        req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ заборонено'
      });
    }

    // Продовження на 1 рік
    const newStartDate = policy.endDate > new Date() ? policy.endDate : new Date();
    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    policy.startDate = newStartDate;
    policy.endDate = newEndDate;
    policy.status = 'active';

    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Поліс продовжено на 1 рік',
      data: policy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Розрахунок вартості полісу 
// @route   POST /api/policies/calculate
// @access  Private
exports.calculatePremium = async (req, res) => {
  try {
    const { coverageType, petSpecies, petAge } = req.body;

    // Базові ставки (собівартість)
    const baseRates = { basic: 500, standard: 1000, premium: 2000 };
    const speciesMultipliers = { dog: 1.2, cat: 1.0, bird: 0.6, rabbit: 0.8, other: 1.0 };

    // Розрахунок за віком
    let ageMultiplier = 1.0;
    if (petAge <= 2) ageMultiplier = 0.9;
    else if (petAge <= 5) ageMultiplier = 1.0;
    else if (petAge <= 8) ageMultiplier = 1.3;
    else ageMultiplier = 1.5;

    // Маржа прибутку компанії (25%)
    const profitMargin = 1.25;

    const baseRate = baseRates[coverageType] || baseRates.standard;
    const speciesMultiplier = speciesMultipliers[petSpecies] || 1.0;

    const basePremium = baseRate * speciesMultiplier * ageMultiplier;
    const premium = Math.round(basePremium * profitMargin);
    const companyProfit = Math.round(basePremium * (profitMargin - 1));

    const coverageAmounts = { basic: 10000, standard: 25000, premium: 50000 };
    const deductibles = { basic: 500, standard: 300, premium: 100 };

    res.status(200).json({
      success: true,
      data: {
        premium,
        coverageAmount: coverageAmounts[coverageType],
        deductible: deductibles[coverageType],
        breakdown: {
          baseRate,
          speciesMultiplier,
          ageMultiplier,
          profitMargin: '25%',
          basePremium: Math.round(basePremium),
          companyProfit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
