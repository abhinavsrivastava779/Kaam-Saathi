const mongoose = require('mongoose');

const ivrSessionSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true
    },
    currentStep: {
      type: String,
      enum: ['WELCOME', 'SKILL', 'NAME', 'AREA', 'RATE', 'AVAILABILITY', 'COMPLETED'],
      default: 'WELCOME'
    },
    data: {
      type: Object,
      default: {}
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'failed'],
      default: 'in-progress'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('IVRSession', ivrSessionSchema);
