const User = require('../models/User');
const Pet = require('../models/Pet');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Отримати користувача за ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Оновити профіль користувача
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Кабінет власника тварини 
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const pets = await Pet.find({ owner: userId, isActive: true });
    const policies = await Policy.find({ owner: userId }).populate('pet', 'name species');
    const claims = await Claim.find({ policy: { $in: policies.map(p => p._id) } })
      .populate('policy', 'policyNumber')
      .sort({ claimDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user: { id: req.user._id, name: `${req.user.firstName} ${req.user.lastName}`, email: req.user.email },
        summary: {
          totalPets: pets.length,
          totalPolicies: policies.length,
          activePolicies: policies.filter(p => p.status === 'active').length,
          pendingClaims: claims.filter(c => c.status === 'pending').length
        },
        pets,
        policies,
        recentClaims: claims
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Медична історія тварини
// @route   GET /api/users/pets/:petId/medical-history
// @access  Private
exports.getPetMedicalHistory = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) return res.status(404).json({ success: false, message: 'Тварину не знайдено' });

    if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'veterinarian') {
      return res.status(403).json({ success: false, message: 'Доступ заборонено' });
    }

    const records = await MedicalRecord.find({ pet: req.params.petId })
      .populate('clinic', 'name')
      .populate('veterinarian', 'firstName lastName')
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      data: { pet: { id: pet._id, name: pet.name, species: pet.species }, records }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
