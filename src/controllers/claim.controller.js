const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

// @desc    Створити новий страховий випадок
// @route   POST /api/claims
// @access  Private
exports.createClaim = async (req, res) => {
  try {
    // Генерація номера заявки
    const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    req.body.claimNumber = claimNumber;

    // Перевірка чи існує активний поліс
    const policy = await Policy.findById(req.body.policy);
    if (!policy || policy.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Поліс не активний або не знайдено'
      });
    }

    const claim = await Claim.create(req.body);

    res.status(201).json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати всі страхові випадки
// @route   GET /api/claims
// @access  Private
exports.getAllClaims = async (req, res) => {
  try {
    let query = {};

    // Фільтрація для власників
    if (req.user.role === 'owner') {
      const policies = await Policy.find({ owner: req.user._id });
      const policyIds = policies.map(p => p._id);
      query.policy = { $in: policyIds };
    }

    const claims = await Claim.find(query)
      .populate('policy', 'policyNumber')
      .populate('pet', 'name species breed')
      .populate('clinic', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати страховий випадок за ID
// @route   GET /api/claims/:id
// @access  Private
exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('policy')
      .populate('pet', 'name species breed')
      .populate('clinic', 'name email phone')
      .populate('reviewedBy', 'firstName lastName');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Страховий випадок не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Схвалити страховий випадок
// @route   PUT /api/claims/:id/approve
// @access  Private/Agent
exports.approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Страховий випадок не знайдено'
      });
    }

    // Розрахунок схваленої суми
    const approvedAmount = await claim.calculateApprovedAmount();

    claim.status = 'approved';
    claim.approvedAmount = approvedAmount;
    claim.reviewedBy = req.user._id;
    claim.reviewDate = Date.now();

    await claim.save();

    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Відхилити страховий випадок
// @route   PUT /api/claims/:id/reject
// @access  Private/Agent
exports.rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Страховий випадок не знайдено'
      });
    }

    claim.status = 'rejected';
    claim.rejectionReason = req.body.rejectionReason;
    claim.reviewedBy = req.user._id;
    claim.reviewDate = Date.now();

    await claim.save();

    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Позначити як оплачено
// @route   PUT /api/claims/:id/pay
// @access  Private/Agent
exports.markAsPaid = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Страховий випадок не знайдено'
      });
    }

    if (claim.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Випадок має бути спочатку схвалено'
      });
    }

    claim.status = 'paid';
    claim.paymentDate = Date.now();

    await claim.save();

    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
