const IVRSession = require('../models/IVRSession');
const Worker = require('../models/Worker');
const telephonyProvider = require('../services/telephony');

// @desc Handle incoming IVR call session initialization
// @route POST /api/ivr/incoming
exports.incoming = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const cleanPhone = phone ? phone.trim() : `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;

    let session = await IVRSession.findOne({ phone: cleanPhone, status: 'in-progress' });

    if (!session) {
      session = await IVRSession.create({
        phone: cleanPhone,
        currentStep: 'WELCOME',
        data: {},
        status: 'in-progress'
      });
    }

    const promptText = telephonyProvider.getIVRPrompt(session.currentStep);

    res.status(200).json({
      success: true,
      sessionId: session._id,
      phone: cleanPhone,
      currentStep: session.currentStep,
      promptText,
      data: session.data
    });
  } catch (err) {
    next(err);
  }
};

// @desc Process IVR input key/voice step
// @route POST /api/ivr/input
exports.input = async (req, res, next) => {
  try {
    const { phone, inputKey, inputText } = req.body;

    const session = await IVRSession.findOne({ phone, status: 'in-progress' });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'कोई सक्रिय IVR कॉल सत्र नहीं मिला।'
      });
    }

    let nextStep = session.currentStep;
    let data = session.data || {};

    const skillMapKey = {
      '1': 'mistri',
      '2': 'painter',
      '3': 'carpenter',
      '4': 'plumber',
      '5': 'cleaning',
      '6': 'helper'
    };

    switch (session.currentStep) {
      case 'WELCOME':
      case 'SKILL':
        data.skill = skillMapKey[inputKey] || inputText || 'helper';
        nextStep = 'NAME';
        break;

      case 'NAME':
        data.name = inputText || inputKey || 'IVR User';
        nextStep = 'AREA';
        break;

      case 'AREA':
        data.area = inputText || inputKey || 'Shikohabad';
        nextStep = 'RATE';
        break;

      case 'RATE':
        data.dailyRate = parseInt(inputText || inputKey || '700') || 700;
        nextStep = 'AVAILABILITY';
        break;

      case 'AVAILABILITY':
        data.availability = inputKey === '1' || inputText === '1' || inputText === 'हाँ';
        nextStep = 'COMPLETED';
        session.status = 'completed';

        // Auto-create worker profile
        await Worker.create({
          name: data.name || 'IVR Worker',
          phone: phone,
          skill: data.skill || 'helper',
          dailyRate: data.dailyRate || 700,
          area: data.area || 'Shikohabad',
          availability: data.availability,
          registrationSource: 'ivr'
        });
        break;

      default:
        nextStep = 'COMPLETED';
        break;
    }

    session.currentStep = nextStep;
    session.data = data;
    await session.save();

    const promptText = telephonyProvider.getIVRPrompt(nextStep);

    res.status(200).json({
      success: true,
      sessionId: session._id,
      currentStep: nextStep,
      promptText,
      data: session.data,
      isCompleted: nextStep === 'COMPLETED'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Trigger IVR callback for missed calls
// @route POST /api/ivr/callback
exports.callback = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'मोबाइल नंबर आवश्यक है।'
      });
    }

    const callbackResponse = await telephonyProvider.triggerCallback(phone);

    // Create session
    const session = await IVRSession.create({
      phone: phone.trim(),
      currentStep: 'WELCOME',
      data: {},
      status: 'in-progress'
    });

    res.status(200).json({
      success: true,
      message: 'मिस्ड कॉल प्राप्त हुई। IVR कॉल वापस लगाई जा रही है...',
      telephonyResponse: callbackResponse,
      sessionId: session._id
    });
  } catch (err) {
    next(err);
  }
};

// @desc Explicitly create worker from IVR payload
// @route POST /api/ivr/create-worker
exports.createWorker = async (req, res, next) => {
  try {
    const { phone, name, skill, dailyRate, area, availability } = req.body;

    const worker = await Worker.create({
      name: name || 'IVR Worker',
      phone: phone || `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      skill: skill || 'helper',
      dailyRate: dailyRate || 700,
      area: area || 'Shikohabad',
      availability: typeof availability === 'boolean' ? availability : true,
      registrationSource: 'ivr'
    });

    res.status(201).json({
      success: true,
      worker,
      message: 'IVR के ज़रिये प्रोफाइल बन गया।'
    });
  } catch (err) {
    next(err);
  }
};
