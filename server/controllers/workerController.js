const Worker = require('../models/Worker');
const Rating = require('../models/Rating');
const Employer = require('../models/Employer');

// Skill normalization map
const skillMap = {
  mistri: 'mistri',
  'मिस्त्री': 'mistri',
  painter: 'painter',
  'पेंटर': 'painter',
  carpenter: 'carpenter',
  'बढ़ई': 'carpenter',
  plumber: 'plumber',
  'प्लंबर': 'plumber',
  cleaning: 'cleaning',
  'सफाई': 'cleaning',
  helper: 'helper',
  'मज़दूर': 'helper',
  cook: 'cook', 'बावर्ची': 'cook',
  electrician: 'electrician', 'इलेक्ट्रीशियन': 'electrician'
};

// @desc Create new worker profile
// @route POST /api/workers
exports.createWorker = async (req, res, next) => {
  try {
    const { name, phone, photo, skill, dailyRate, area, city, state, location, availability, registrationSource } = req.body;

    if (!name || !phone || !skill || !dailyRate || !area) {
      return res.status(400).json({
        success: false,
        message: 'सभी आवश्यक जानकारी (नाम, फोन, काम, दिहाड़ी, इलाका) भरें।'
      });
    }

    // Check if worker with phone already exists
    let worker = await Worker.findOne({ phone: phone.trim() });

    if (worker) {
      // Update existing
      worker.name = name.trim();
      worker.photo = photo || worker.photo;
      worker.skill = skill.trim();
      worker.dailyRate = Number(dailyRate);
      worker.area = area.trim();
      if (city !== undefined) worker.city = String(city).trim();
      if (state !== undefined) worker.state = String(state).trim();
      if (location && location.lat && location.long) {
        worker.location = { lat: Number(location.lat), long: Number(location.long) };
      }
      if (typeof availability === 'boolean') {
        worker.availability = availability;
      }
      if (registrationSource) {
        worker.registrationSource = registrationSource;
      }
      await worker.save();
    } else {
      worker = await Worker.create({
        name: name.trim(),
        phone: phone.trim(),
        photo: photo || '',
        skill: skill.trim(),
        dailyRate: Number(dailyRate),
        area: area.trim(),
        city: city ? String(city).trim() : '',
        state: state ? String(state).trim() : '',
        location: {
          lat: location && location.lat ? Number(location.lat) : 27.15,
          long: location && location.long ? Number(location.long) : 78.39
        },
        availability: typeof availability === 'boolean' ? availability : true,
        registrationSource: registrationSource || 'app'
      });
    }

    res.status(201).json({
      success: true,
      worker,
      message: 'प्रोफाइल सफलता से बन गया!'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get workers list with filtering
// @route GET /api/workers
exports.getWorkers = async (req, res, next) => {
  try {
    const { skill, area, availability, dailyRate, search } = req.query;

    const query = {};

    if (skill && skill !== 'all' && skill !== 'सभी') {
      // match exact skill or translated skill
      const normalized = skillMap[skill] || skill;
      const matchingSkills = Object.keys(skillMap).filter(k => skillMap[k] === normalized);
      matchingSkills.push(skill);
      query.skill = { $in: matchingSkills };
    }

    if (availability !== undefined && availability !== 'all') {
      query.availability = availability === 'true' || availability === '1';
    }

    if (area) {
      query.area = { $regex: area, $options: 'i' };
    }

    if (dailyRate) {
      query.dailyRate = { $lte: Number(dailyRate) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { skill: { $regex: search, $options: 'i' } }
      ];
    }

    // Available workers first, then latest created
    const workers = await Worker.find(query).select('-kyc.aadhaarNumber -kyc.aadhaarPhoto -kyc.personalPhoto').sort({ availability: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single worker by ID
// @route GET /api/workers/:id
exports.getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id).select('-kyc.aadhaarNumber -kyc.aadhaarPhoto -kyc.personalPhoto');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'मज़दूर नहीं मिला।'
      });
    }

    res.status(200).json({
      success: true,
      worker
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update worker profile
// @route PATCH /api/workers/:id
exports.updateWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'मज़दूर नहीं मिला।'
      });
    }

    res.status(200).json({
      success: true,
      worker,
      message: 'प्रोफाइल अपडेट हो गया।'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Toggle worker availability
// @route PATCH /api/workers/:id/availability
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    if (typeof availability !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'उपलब्धता स्थिति (true/false) आवश्यक है।'
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'मज़दूर नहीं मिला।'
      });
    }

    res.status(200).json({
      success: true,
      worker,
      message: availability ? 'आप अब उपलब्ध हैं।' : 'आप अब उपलब्ध नहीं हैं।'
    });
  } catch (err) {
    next(err);
  }
};


// @desc Add a worker rating — one rating per employer/worker pair
// @route POST /api/workers/:id/rating
exports.addRating = async (req, res, next) => {
  try {
    if (req.user?.role !== 'employer' || !req.user.employerId) {
      return res.status(403).json({ success:false, message:'सिर्फ logged-in employer rating दे सकता है।' });
    }
    const rating = Number(req.body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success:false, message:'रेटिंग 1 से 5 स्टार के बीच होनी चाहिए।' });
    }
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success:false, message:'मज़दूर नहीं मिला।' });
    const employer = await Employer.findById(req.user.employerId);
    if (!employer) return res.status(404).json({ success:false, message:'Employer profile नहीं मिली।' });

    try {
      await Rating.create({ employer: employer._id, worker: worker._id, rating });
    } catch (e) {
      if (e?.code === 11000) return res.status(409).json({ success:false, message:'आप इस मज़दूर को पहले ही rating दे चुके हैं।' });
      throw e;
    }

    const oldSum = Number(worker.ratingSum || 0);
    const oldCount = Number(worker.ratingCount || 0);
    const newCount = oldCount + 1;
    worker.ratingSum = oldSum + rating;
    worker.ratingCount = newCount;
    worker.ratingAverage = Number((worker.ratingSum / newCount).toFixed(1));
    await worker.save();
    res.status(200).json({ success:true, worker, message:'रेटिंग सेव हो गई। धन्यवाद!' });
  } catch (err) { next(err); }
};

exports.getMyProfile=async(req,res,next)=>{try{if(req.user.role!=='worker'||!req.user.workerId)return res.status(403).json({success:false,message:'Worker login आवश्यक है।'});const worker=await Worker.findById(req.user.workerId);res.json({success:true,worker})}catch(e){next(e)}};
exports.submitKyc = async (req, res, next) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ success: false, message: 'Worker login आवश्यक है।' });
    }

    // The OTP token can be issued before the worker profile is created,
    // so workerId may be null/stale. Verify ownership using both the
    // authenticated phone and the target worker's phone.
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'प्रोफाइल नहीं मिली।' });
    }

    const tokenPhone = String(req.user.phone || '').replace(/\D/g, '').replace(/^91/, '').slice(-10);
    const workerPhone = String(worker.phone || '').replace(/\D/g, '').replace(/^91/, '').slice(-10);

    const ownsWorker =
      (req.user.workerId && String(req.user.workerId) === String(worker._id)) ||
      (tokenPhone && workerPhone && tokenPhone === workerPhone);

    if (!ownsWorker) {
      return res.status(403).json({ success: false, message: 'सिर्फ अपनी KYC जमा करें।' });
    }

    const { aadhaarNumber, aadhaarPhoto, personalPhoto } = req.body;
    const a = String(aadhaarNumber || '').replace(/\D/g, '');

    if (!/^\d{12}$/.test(a)) {
      return res.status(400).json({ success: false, message: 'Aadhaar number 12 अंकों का होना चाहिए।' });
    }
    if (!aadhaarPhoto || !personalPhoto) {
      return res.status(400).json({ success: false, message: 'Aadhaar photo और current photo दोनों जरूरी हैं।' });
    }

    // MongoDB documents have a 16 MB limit. Images are sent as base64 data URLs,
    // so keep each document comfortably below that limit.
    const maxPhotoChars = 2_000_000;
    if (String(aadhaarPhoto).length > maxPhotoChars || String(personalPhoto).length > maxPhotoChars) {
      return res.status(413).json({
        success: false,
        message: 'फोटो बहुत बड़ी है। कृपया दोनों फोटो दोबारा चुनें (हर फोटो 1.5 MB के अंदर रखें)।'
      });
    }

    if (!String(aadhaarPhoto).startsWith('data:image/') || !String(personalPhoto).startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'कृपया केवल image photo upload करें।' });
    }

    worker.kyc = {
      status: 'pending',
      aadhaarNumber: a,
      aadhaarPhoto: String(aadhaarPhoto),
      personalPhoto: String(personalPhoto),
      submittedAt: new Date(),
      verifiedAt: null,
      rejectionReason: ''
    };

    await worker.save();

    res.json({
      success: true,
      worker,
      message: 'KYC जमा हो गई। 24 घंटे में verification होगी।'
    });
  } catch (e) {
    if (e?.name === 'MongooseError' || /BSON|document.*larg|too large/i.test(String(e?.message || ''))) {
      return res.status(413).json({
        success: false,
        message: 'KYC फोटो का कुल आकार बहुत बड़ा है। कृपया छोटी फोटो upload करें।'
      });
    }
    next(e);
  }
};
// @desc Delete worker
// @route DELETE /api/workers/:id
exports.deleteWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'मज़दूर नहीं मिला।'
      });
    }

    res.status(200).json({
      success: true,
      message: 'मज़दूर प्रोफाइल हटा दिया गया है।'
    });
  } catch (err) {
    next(err);
  }
};
