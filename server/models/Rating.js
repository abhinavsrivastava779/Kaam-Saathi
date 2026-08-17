const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true, index: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

// One employer can rate a particular worker only once.
ratingSchema.index({ employer: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
