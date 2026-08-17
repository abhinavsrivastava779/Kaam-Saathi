const OTP = require('../models/OTP');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const jwt = require('jsonwebtoken');
const otpProvider = require('../services/otp');

const cleanPhone = (p) =>
  String(p || '').replace(/\D/g, '').replace(/^91/, '').slice(-10);

const sign = (p) =>
  jwt.sign(
    p,
    process.env.JWT_SECRET || 'kaam_saathi_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
);

const makeOtp = () => String(Math.floor(1000 + Math.random() * 9000));

exports.sendOtp = async (req, res, next) => {
  try {
    const phone = cleanPhone(req.body.phone);
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।'
      });
    }

    const otp = makeOtp();

    await OTP.findOneAndDelete({ phone });
    await OTP.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Always print the test OTP when explicitly enabled.
    // For MSG91 this is the OTP supplied to the SendOTP API.
    if (process.env.OTP_DEBUG === 'true') {
      console.log(`\n🔐 [Kaam Saathi OTP] +91${phone} => ${otp}\n`);
    }

    await otpProvider.sendOtp(phone, otp);

    res.json({
      success: true,
      message: 'OTP भेजा गया।',
      ...(process.env.OTP_DEBUG === 'true' ? { devOtp: otp } : {})
    });
  } catch (e) {
    console.error('[OTP SEND FAILED]', e?.details || e);
    next(e);
  }
};

const verifyStoredOtp = async (phone, otp) => {
  const r = await OTP.findOne({ phone });
  if (!r || r.expiresAt < new Date()) {
    const error = new Error('OTP expire हो गया।');
    error.status = 400;
    throw error;
  }

  if (process.env.OTP_PROVIDER === 'msg91') {
    try {
      await otpProvider.verifyOtp(phone, otp);
    } catch (msg91Err) {
      if (r.otp && r.otp !== 'external' && r.otp === otp) {
        console.log('[MSG91 Verify Fallback] Local OTP match succeeded despite MSG91 API response:', msg91Err.message);
      } else {
        throw msg91Err;
      }
    }
  } else if (r.otp !== otp) {
    const error = new Error('गलत OTP।');
    error.status = 400;
    throw error;
  }

  await OTP.deleteOne({ _id: r._id });
  return r;
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const phone = cleanPhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();

    if (!/^\d{10}$/.test(phone) || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 4 अंकों का OTP दर्ज करें।'
      });
    }

    await verifyStoredOtp(phone, otp);
    const worker = await Worker.findOne({ phone });

    res.json({
      success: true,
      token: sign({
        role: 'worker',
        phone,
        workerId: worker?._id || null
      }),
      phone,
      hasProfile: !!worker,
      worker: worker || null
    });
  } catch (e) {
    next(e);
  }
};

exports.sendEmployerOtp = exports.sendOtp;

exports.verifyEmployerOtp = async (req, res, next) => {
  try {
    const phone = cleanPhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();

    if (!/^\d{10}$/.test(phone) || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 4 अंकों का OTP दर्ज करें।'
      });
    }

    await verifyStoredOtp(phone, otp);

    let employer = await Employer.findOne({ phone });
    const isNewEmployer = !employer;

    if (!employer) {
      employer = await Employer.create({ phone, name: '', photo: '' });
    }

    res.json({
      success: true,
      token: sign({
        role: 'employer',
        phone,
        employerId: employer._id
      }),
      employer,
      isNewEmployer,
      role: 'employer'
    });
  } catch (e) {
    next(e);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    if (req.user.role === 'employer') {
      return res.json({
        success: true,
        role: 'employer',
        employer: await Employer.findById(req.user.employerId)
      });
    }

    res.json({
      success: true,
      role: 'worker',
      worker: await Worker.findById(req.user.workerId)
    });
  } catch (e) {
    next(e);
  }
};
