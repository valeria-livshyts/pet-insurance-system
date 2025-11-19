const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Перевірка автентифікації
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Перевірка наявності токену в заголовку
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Доступ заборонено. Необхідна автентифікація'
      });
    }

    try {
      // Верифікація токену
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Отримання користувача з БД
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Користувача не знайдено'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Обліковий запис деактивовано'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Невалідний токен'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка сервера при автентифікації'
    });
  }
};

// Перевірка ролі користувача
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Роль ${req.user.role} не має доступу до цього ресурсу`
      });
    }
    next();
  };
};

// Перевірка власності ресурсу
exports.checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ресурс не знайдено'
        });
      }

      // Адміністратори мають доступ до всього
      if (req.user.role === 'admin') {
        return next();
      }

      // Перевірка чи є користувач власником
      if (resource.owner && resource.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Доступ заборонено'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка перевірки прав доступу'
      });
    }
  };
};
