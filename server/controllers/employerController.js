const Employer = require('../models/Employer');
const Rating = require('../models/Rating');

exports.getMyProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer' || !req.user.employerId) {
      return res.status(403).json({ success: false, message: 'Employer login आवश्यक है।' });
    }
    const employer = await Employer.findById(req.user.employerId);
    if (!employer) return res.status(404).json({ success: false, message: 'Employer profile नहीं मिली।' });
    const ratingsGiven = await Rating.countDocuments({ employer: employer._id });
    res.json({ success: true, employer, stats: { ratingsGiven } });
  } catch (e) { next(e); }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer' || !req.user.employerId) {
      return res.status(403).json({ success: false, message: 'Employer login आवश्यक है।' });
    }
    const { name, photo } = req.body;
    const employer = await Employer.findById(req.user.employerId);
    if (!employer) return res.status(404).json({ success: false, message: 'Employer profile नहीं मिली।' });
    if (name !== undefined) employer.name = String(name).trim().slice(0, 80) || 'Employer';
    if (photo !== undefined) employer.photo = String(photo);
    await employer.save();
    res.json({ success: true, employer, message: 'Employer profile अपडेट हो गई।' });
  } catch (e) { next(e); }
};
