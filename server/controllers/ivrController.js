const IVRSession = require('../models/IVRSession');
const Worker = require('../models/Worker');
const telephonyProvider = require('../services/telephony');

// ==========================================
// PHONE NORMALIZER
// ==========================================
const normalizePhone = (phone) => {
  if (!phone) return '';

  let value = String(phone).trim();

  // Remove spaces
  value = value.replace(/\s+/g, '');

  // 9876543210 -> +919876543210
  if (/^\d{10}$/.test(value)) {
    return `+91${value}`;
  }

  // 919876543210 -> +919876543210
  if (/^91\d{10}$/.test(value)) {
    return `+${value}`;
  }

  // +919876543210 -> same
  if (/^\+91\d{10}$/.test(value)) {
    return value;
  }

  return value;
};

// ==========================================
// GENERATE FALLBACK PHONE
// ==========================================
const generateFallbackPhone = () => {
  return `+91${Math.floor(
    6000000000 + Math.random() * 3999999999
  )}`;
};


// ==========================================
// @desc    Handle incoming IVR call session initialization
// @route   POST /api/ivr/incoming
// ==========================================
exports.incoming = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Normalize incoming phone
    const cleanPhone = phone
      ? normalizePhone(phone)
      : generateFallbackPhone();

    // Find existing active IVR session
    let session = await IVRSession.findOne({
      phone: cleanPhone,
      status: 'in-progress'
    });

    // Create new session if no active session exists
    if (!session) {
      session = await IVRSession.create({
        phone: cleanPhone,
        currentStep: 'WELCOME',
        data: {},
        status: 'in-progress'
      });
    }

    const promptText =
      telephonyProvider.getIVRPrompt(
        session.currentStep
      );

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


// ==========================================
// @desc    Process IVR input key/voice step
// @route   POST /api/ivr/input
// ==========================================
exports.input = async (req, res, next) => {
  try {
    const {
      phone,
      inputKey,
      inputText
    } = req.body;

    // Normalize phone before searching session
    const cleanPhone = normalizePhone(phone);

    // Find active IVR session
    const session = await IVRSession.findOne({
      phone: cleanPhone,
      status: 'in-progress'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          'कोई सक्रिय IVR कॉल सत्र नहीं मिला।'
      });
    }

    let nextStep = session.currentStep;
    let data = session.data || {};

    // ==========================================
    // SKILL MAP
    // ==========================================
    const skillMapKey = {
      '1': 'mistri',
      '2': 'painter',
      '3': 'carpenter',
      '4': 'plumber',
      '5': 'cleaning',
      '6': 'helper'
    };

    // ==========================================
    // IVR FLOW
    // ==========================================
    switch (session.currentStep) {

      // ------------------------------------------
      // WELCOME / SKILL
      // ------------------------------------------
      case 'WELCOME':
      case 'SKILL':

        data.skill =
          skillMapKey[inputKey] ||
          inputText ||
          'helper';

        nextStep = 'NAME';

        break;


      // ------------------------------------------
      // NAME
      // ------------------------------------------
      case 'NAME':

        data.name =
          inputText ||
          inputKey ||
          'IVR User';

        nextStep = 'AREA';

        break;


      // ------------------------------------------
      // AREA
      // ------------------------------------------
      case 'AREA':

        data.area =
          inputText ||
          inputKey ||
          'Shikohabad';

        nextStep = 'RATE';

        break;


      // ------------------------------------------
      // DAILY RATE
      // ------------------------------------------
      case 'RATE':

        data.dailyRate =
          parseInt(
            inputText ||
            inputKey ||
            '700'
          ) || 700;

        nextStep = 'AVAILABILITY';

        break;


      // ------------------------------------------
      // AVAILABILITY
      // ------------------------------------------
      case 'AVAILABILITY':

        data.availability =
          inputKey === '1' ||
          inputText === '1' ||
          inputText === 'हाँ';

        nextStep = 'COMPLETED';

        session.status = 'completed';

        // ==========================================
        // DUPLICATE WORKER PROTECTION
        // ==========================================

        // First check if worker already exists
        let worker = await Worker.findOne({
          phone: cleanPhone
        });

        // Only create worker if it does not exist
        if (!worker) {
          worker = await Worker.create({
            name:
              data.name ||
              'IVR Worker',

            phone: cleanPhone,

            skill:
              data.skill ||
              'helper',

            dailyRate:
              data.dailyRate ||
              700,

            area:
              data.area ||
              'Shikohabad',

            availability:
              data.availability,

            registrationSource: 'ivr'
          });
        }

        break;


      // ------------------------------------------
      // DEFAULT
      // ------------------------------------------
      default:

        nextStep = 'COMPLETED';

        break;
    }

    // ==========================================
    // SAVE SESSION
    // ==========================================
    session.currentStep = nextStep;
    session.data = data;

    await session.save();

    // ==========================================
    // NEXT PROMPT
    // ==========================================
    const promptText =
      telephonyProvider.getIVRPrompt(
        nextStep
      );

    res.status(200).json({
      success: true,
      sessionId: session._id,
      currentStep: nextStep,
      promptText,
      data: session.data,
      isCompleted:
        nextStep === 'COMPLETED'
    });

  } catch (err) {
    next(err);
  }
};


// ==========================================
// @desc    Trigger IVR callback for missed calls
// @route   POST /api/ivr/callback
// ==========================================
exports.callback = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message:
          'मोबाइल नंबर आवश्यक है।'
      });
    }

    // Normalize phone
    const cleanPhone =
      normalizePhone(phone);

    // Trigger callback
    const callbackResponse =
      await telephonyProvider.triggerCallback(
        cleanPhone
      );

    // ==========================================
    // CREATE IVR SESSION
    // ==========================================
    const session =
      await IVRSession.create({
        phone: cleanPhone,
        currentStep: 'WELCOME',
        data: {},
        status: 'in-progress'
      });

    res.status(200).json({
      success: true,
      message:
        'मिस्ड कॉल प्राप्त हुई। IVR कॉल वापस लगाई जा रही है...',
      telephonyResponse:
        callbackResponse,
      sessionId: session._id
    });

  } catch (err) {
    next(err);
  }
};


// ==========================================
// @desc    Explicitly create worker from IVR payload
// @route   POST /api/ivr/create-worker
// ==========================================
exports.createWorker = async (
  req,
  res,
  next
) => {
  try {
    const {
      phone,
      name,
      skill,
      dailyRate,
      area,
      availability
    } = req.body;

    // Normalize phone
    const cleanPhone = phone
      ? normalizePhone(phone)
      : generateFallbackPhone();

    // ==========================================
    // DUPLICATE WORKER CHECK
    // ==========================================
    let worker = await Worker.findOne({
      phone: cleanPhone
    });

    // If worker already exists
    if (worker) {
      return res.status(200).json({
        success: true,
        worker,
        alreadyExists: true,
        message:
          'इस मोबाइल नंबर से worker profile पहले से मौजूद है।'
      });
    }

    // ==========================================
    // CREATE NEW WORKER
    // ==========================================
    worker = await Worker.create({
      name:
        name ||
        'IVR Worker',

      phone: cleanPhone,

      skill:
        skill ||
        'helper',

      dailyRate:
        dailyRate ||
        700,

      area:
        area ||
        'Shikohabad',

      availability:
        typeof availability === 'boolean'
          ? availability
          : true,

      registrationSource: 'ivr'
    });

    res.status(201).json({
      success: true,
      worker,
      alreadyExists: false,
      message:
        'IVR के ज़रिये प्रोफाइल बन गया।'
    });

  } catch (err) {
    next(err);
  }
};