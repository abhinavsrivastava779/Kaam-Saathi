const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const Rating = require('../models/Rating');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const validUser = username === (process.env.ADMIN_USERNAME || 'admin');
    const validPassword = password === (process.env.ADMIN_PASSWORD || 'admin123');
    if (!validUser || !validPassword) {
      return res.status(401).json({ success: false, message: 'यूज़रनेम या पासवर्ड गलत है।' });
    }
    const token = jwt.sign(
      { role: 'admin', username: process.env.ADMIN_USERNAME || 'admin' },
      process.env.JWT_SECRET || 'kaam_saathi_super_secret_jwt_key_2026',
      { expiresIn: '8h' }
    );
    res.json({ success: true, token });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalWorkers = await Worker.countDocuments();
    const availableWorkers = await Worker.countDocuments({ availability: true });
    const unavailableWorkers = await Worker.countDocuments({ availability: false });
    const skillStats = await Worker.aggregate([{ $group: { _id: '$skill', count: { $sum: 1 } } }]);
    const sourceStats = await Worker.aggregate([{ $group: { _id: '$registrationSource', count: { $sum: 1 } } }]);
    const cityStats = await Worker.aggregate([
      { $match: { city: { $nin: ['', null] } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const recentRegistrations = await Worker.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({
      success: true,
      stats: { totalWorkers, availableWorkers, unavailableWorkers, skillStats, sourceStats, cityStats },
      recentRegistrations
    });
  } catch (err) { next(err); }
};

exports.getKyc=async(req,res,next)=>{try{const worker=await Worker.findById(req.params.id);if(!worker)return res.status(404).json({success:false,message:'Worker नहीं मिला।'});res.json({success:true,worker})}catch(e){next(e)}};
exports.updateKyc=async(req,res,next)=>{try{const {status,rejectionReason}=req.body;if(!['pending','verified','rejected'].includes(status))return res.status(400).json({success:false,message:'Invalid status'});const worker=await Worker.findById(req.params.id);if(!worker)return res.status(404).json({success:false,message:'Worker नहीं मिला।'});worker.kyc.status=status;worker.kyc.verifiedAt=status==='verified'?new Date():null;worker.kyc.rejectionReason=status==='rejected'?(rejectionReason||'Documents clear नहीं हैं।'):'';await worker.save();res.json({success:true,worker})}catch(e){next(e)}};

exports.getKycSubmissions = async (req, res, next) => {
  try {
    const submissions = await Worker.find({ 'kyc.submittedAt': { $ne: null } })
      .select('name phone photo skill area city state availability kyc createdAt')
      .sort({ 'kyc.submittedAt': -1, createdAt: -1 })
      .lean();

    const pendingCount = submissions.filter(w => w.kyc?.status === 'pending').length;
    const verifiedCount = submissions.filter(w => w.kyc?.status === 'verified').length;
    const rejectedCount = submissions.filter(w => w.kyc?.status === 'rejected').length;

    res.json({
      success: true,
      count: submissions.length,
      counts: { pending: pendingCount, verified: verifiedCount, rejected: rejectedCount },
      submissions
    });
  } catch (e) { next(e); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const [workers, employers] = await Promise.all([
      Worker.find().sort({ createdAt: -1 }).lean(),
      Employer.find().sort({ createdAt: -1 }).lean()
    ]);
    res.json({ success: true, workers, employers });
  } catch (e) { next(e); }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    if (type === 'worker') {
      const worker = await Worker.findById(id).lean();
      if (!worker) return res.status(404).json({ success:false, message:'Worker नहीं मिला।' });
      return res.json({ success:true, type:'worker', user:worker });
    }
    if (type === 'employer') {
      const employer = await Employer.findById(id).lean();
      if (!employer) return res.status(404).json({ success:false, message:'Employer नहीं मिला।' });
      const ratingsGiven = await Rating.countDocuments({ employer: employer._id });
      return res.json({ success:true, type:'employer', user:{ ...employer, stats:{ ratingsGiven } } });
    }
    return res.status(400).json({ success:false, message:'Invalid user type.' });
  } catch (e) { next(e); }
};
