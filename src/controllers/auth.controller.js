const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Реєстрація нового користувача
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, address } = req.body;

    // Перевірка чи користувач вже існує
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Користувач з таким email вже існує'
      });
    }

    // Створення користувача
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || 'owner',
      address
    });

    // Генерація токену
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Авторизація користувача
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Будь ласка, вкажіть email та пароль'
      });
    }

    // Пошук користувача
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Невірні облікові дані'
      });
    }

    // Перевірка пароля
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Невірні облікові дані'
      });
    }

    // Перевірка чи активний акаунт
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Обліковий запис деактивовано'
      });
    }

    // Генерація токену
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Отримати поточного користувача
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

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
