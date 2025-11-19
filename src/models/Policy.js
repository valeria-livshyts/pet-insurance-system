const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  premium: {
    type: Number,
    required: true,
    min: 0
  },
  coverageAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deductible: {
    type: Number,
    default: 0,
    min: 0
  },
  coverageType: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'standard'
  },
  coveredConditions: [{
    type: String
  }],
  exclusions: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Автоматичне оновлення статусу полісу
policySchema.pre('save', function(next) {
  const today = new Date();

  if (this.endDate < today) {
    this.status = 'expired';
  } else if (this.startDate <= today && this.endDate >= today && this.status === 'pending') {
    this.status = 'active';
  }

  next();
});

module.exports = mongoose.model('Policy', policySchema);
