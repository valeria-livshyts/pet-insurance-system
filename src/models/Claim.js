const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic'
  },
  claimDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  incidentDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: [true, 'Опис випадку є обов\'язковим']
  },
  diagnosis: {
    type: String
  },
  claimType: {
    type: String,
    enum: ['illness', 'accident', 'surgery', 'checkup', 'other'],
    required: true
  },
  claimAmount: {
    type: Number,
    required: true,
    min: 0
  },
  approvedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  documents: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Автоматичний розрахунок схваленої суми
claimSchema.methods.calculateApprovedAmount = async function() {
  const policy = await mongoose.model('Policy').findById(this.policy);

  if (!policy) {
    throw new Error('Поліс не знайдено');
  }

  // Враховуємо франшизу
  let approvedAmount = this.claimAmount - policy.deductible;

  // Перевіряємо ліміт покриття
  if (approvedAmount > policy.coverageAmount) {
    approvedAmount = policy.coverageAmount;
  }

  // Не може бути від'ємною
  if (approvedAmount < 0) {
    approvedAmount = 0;
  }

  return approvedAmount;
};

module.exports = mongoose.model('Claim', claimSchema);
