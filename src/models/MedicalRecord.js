const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  veterinarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  recordType: {
    type: String,
    enum: ['checkup', 'vaccination', 'surgery', 'diagnosis', 'treatment', 'test'],
    required: true
  },
  diagnosis: {
    type: String
  },
  symptoms: [{
    type: String
  }],
  treatment: {
    type: String
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    duration: String
  }],
  vaccinations: [{
    vaccineName: String,
    vaccineDate: Date,
    nextDueDate: Date,
    batchNumber: String
  }],
  tests: [{
    testType: String,
    testDate: Date,
    results: String,
    files: [String]
  }],
  procedures: [{
    procedureName: String,
    procedureDate: Date,
    notes: String
  }],
  vitalSigns: {
    temperature: Number,
    weight: Number,
    heartRate: Number,
    respiratoryRate: Number
  },
  cost: {
    type: Number,
    min: 0
  },
  notes: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  relatedClaim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }
}, {
  timestamps: true
});

// Індекси для швидкого пошуку
medicalRecordSchema.index({ pet: 1, visitDate: -1 });
medicalRecordSchema.index({ clinic: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
