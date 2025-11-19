const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Clinic:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           description: Назва клініки
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: object
 */

const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Назва клініки є обов\'язковою'],
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    country: String,
    postalCode: String
  },
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Clinic', clinicSchema);
