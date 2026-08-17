const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Worker name is required'], trim: true },
    phone: { type: String, required: [true, 'Worker phone is required'], trim: true },
    photo: { type: String, default: '' },
    skill: {
      type: String,
      required: [true, 'Worker skill is required'],
      enum: [
        'mistri', 'painter', 'carpenter', 'plumber', 'cleaning', 'helper', 'cook', 'electrician',
        'मिस्त्री', 'पेंटर', 'बढ़ई', 'प्लंबर', 'सफाई', 'मज़दूर', 'बावर्ची', 'इलेक्ट्रीशियन'
      ],
      trim: true
    },
    dailyRate: { type: Number, required: [true, 'Daily rate is required'], min: [100, 'Daily rate must be at least 100'] },
    area: { type: String, required: [true, 'Area/location text is required'], trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    location: {
      lat: { type: Number, default: 27.15 },
      long: { type: Number, default: 78.39 }
    },
    availability: { type: Boolean, default: true },
    kyc: { status: { type: String, enum: ['pending','verified','rejected'], default: 'pending', index: true }, aadhaarNumber: { type: String, default: '' }, aadhaarPhoto: { type: String, default: '' }, personalPhoto: { type: String, default: '' }, submittedAt: { type: Date, default: null }, verifiedAt: { type: Date, default: null }, rejectionReason: { type: String, default: '' } },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    ratingSum: { type: Number, default: 0, min: 0 },
    registrationSource: {
      type: String,
      enum: ['app', 'whatsapp', 'missed-call', 'ivr', 'helpline'],
      default: 'app'
    }
  },
  { timestamps: true }
);

workerSchema.index({ 'location.lat': 1, 'location.long': 1 });

module.exports = mongoose.model('Worker', workerSchema);
