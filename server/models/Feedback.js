const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Anonymous',
      trim: true
    },

    phone: {
      type: String,
      default: ''
    },

    role: {
      type: String,
      enum: ['worker', 'employer', 'guest'],
      default: 'guest'
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    status: {
      type: String,
      enum: ['new', 'reviewed'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);