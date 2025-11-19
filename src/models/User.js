const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Унікальний ідентифікатор користувача
 *         email:
 *           type: string
 *           description: Електронна пошта
 *         password:
 *           type: string
 *           description: Пароль (хешований)
 *         firstName:
 *           type: string
 *           description: Ім'я
 *         lastName:
 *           type: string
 *           description: Прізвище
 *         phone:
 *           type: string
 *           description: Телефон
 *         role:
 *           type: string
 *           enum: [owner, veterinarian, agent, admin]
 *           description: Роль користувача
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
 *             postalCode:
 *               type: string
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email є обов\'язковим'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Невірний формат email']
  },
  password: {
    type: String,
    required: [true, 'Пароль є обов\'язковим'],
    minlength: [6, 'Пароль має містити мінімум 6 символів'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'Ім\'я є обов\'язковим'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Прізвище є обов\'язковим'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['owner', 'veterinarian', 'agent', 'admin'],
    default: 'owner',
    required: true
  },
  address: {
    street: String,
    city: String,
    country: String,
    postalCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Хешування пароля перед збереженням
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Метод для порівняння паролів
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Віртуальне поле для повного імені
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
