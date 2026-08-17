const Worker = require('../models/Worker');
const Employer = require('../models/Employer');

const cleanHistory = (history) => Array.isArray(history)
  ? history
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 1500) }))
  : [];

const getUserContext = async (req) => {
  const role = req.user?.role;
  if (role === 'worker') {
    const worker = req.user.workerId ? await Worker.findById(req.user.workerId).lean() : await Worker.findOne({ phone: req.user.phone }).lean();
    return {
      role: 'worker',
      name: worker?.name || '',
      phone: worker?.phone || req.user.phone || '',
      skill: worker?.skill || '',
      area: worker?.area || '',
      city: worker?.city || '',
      availability: worker?.availability ?? false,
      kycStatus: worker?.kycStatus || 'not_verified'
    };
  }

  if (role === 'employer') {
    const employer = req.user.employerId ? await Employer.findById(req.user.employerId).lean() : await Employer.findOne({ phone: req.user.phone }).lean();
    return {
      role: 'employer',
      name: employer?.name || '',
      phone: employer?.phone || req.user.phone || ''
    };
  }

  return { role: role || 'user' };
};

const fallbackReply = (message, context) => {
  const text = String(message || '').toLowerCase();
  if (/kyc|aadhar|aadhaar|verify|verification/.test(text)) {
    return context.role === 'worker'
      ? `Haan ${context.name || 'bhai'} 👍 KYC ke liye Worker Dashboard → KYC Verification me Aadhaar number, Aadhaar photo aur current live camera photo submit karo. Verification admin karta hai.`
      : 'KYC mainly workers ke liye hai. Employer ko worker hire karte waqt Verified Worker ko preference deni chahiye.';
  }
  if (/worker|mazdoor|mistri|electrician|plumber|painter|carpenter|काम/.test(text)) {
    return 'Bilkul 👍 Aap Employer hain to "Mazdoor Khojein" me skill, availability aur distance ke hisaab se workers dekh sakte ho. Verified worker ko priority dena better hai.';
  }
  if (/available|aaj|availability/.test(text)) {
    return context.role === 'worker'
      ? `Aaj available status aap Worker Dashboard se change kar sakte ho. Abhi aapka status: ${context.availability ? 'Available ✅' : 'Not available ❌'}.`
      : 'Worker search me "Aaj Available" status ko priority dena useful hai.';
  }
  if (/login|otp|password|register|id/.test(text)) {
    return 'Login/registration ke liye mobile number dijiye, OTP verify kijiye aur phir Kaam Saathi ka dashboard use kijiye. WhatsApp se ID banane ke liye Home par "WhatsApp se ID banaye" option bhi hai.';
  }
  return 'Bilkul 👍 Main Kaam Saathi AI hoon. Aap Hinglish me pooch sakte ho—worker dhoondhna, KYC, availability, registration, dashboard ya app use karne ke baare me.';
};

const callAiProvider = async (message, history, context) => {
  const rawApiKey = String(process.env.AI_API_KEY || '').trim();
  const apiKey = rawApiKey && !/^your_(openai|gemini)_key_here$/i.test(rawApiKey) && rawApiKey !== 'your_api_key_here'
    ? rawApiKey
    : '';

  // Keep the chatbot usable even before an external AI key is configured.
  if (!apiKey) return fallbackReply(message, context);

  const provider = String(process.env.AI_PROVIDER || 'openai').toLowerCase();
  const model = process.env.AI_MODEL || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini');
  const system = `You are Kaam Saathi AI assistant for an Indian hyperlocal worker marketplace.
Always reply naturally in simple Hinglish (Hindi in Devanagari mixed with easy English), unless the user explicitly asks for another language.
Keep replies concise and practical for low-literacy users. Use bullets when helpful.
Never claim to have performed an action unless the app actually provides that action.
Prioritize verified workers for hiring advice. Explain that KYC is admin verification and not a guarantee of safety.
User context: ${JSON.stringify(context)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    if (provider === 'gemini') {
      const endpoint = process.env.AI_API_URL ||
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const contents = [
        { role: 'user', parts: [{ text: system }] },
        ...cleanHistory(history).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: String(message).slice(0, 2000) }] }
      ];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.4, maxOutputTokens: 500 } }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[AI Provider Gemini Warning] Status ${response.status}. Using fallback response.`);
        return fallbackReply(message, context);
      }
      const data = await response.json();
      const textResult = data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('\n').trim();
      return textResult || fallbackReply(message, context);
    }

    const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: system },
          ...cleanHistory(history),
          { role: 'user', content: String(message).slice(0, 2000) }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Provider OpenAI Warning] Status ${response.status}. Using fallback response.`);
      return fallbackReply(message, context);
    }

    const data = await response.json();
    const textResult = data?.choices?.[0]?.message?.content?.trim();
    return textResult || fallbackReply(message, context);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[AI Provider Fetch Warning] ${err.name === 'AbortError' ? 'Timeout (10s)' : err.message}. Using fallback response.`);
    return fallbackReply(message, context);
  }
};

exports.chat = async (req, res, next) => {
  try {
    if (!req.user || !['worker', 'employer'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'AI Chatbot use karne ke liye Worker ya Employer login zaroori hai.' });
    }

    const message = String(req.body.message || '').trim();
    if (!message) return res.status(400).json({ success: false, message: 'Message likhiye.' });

    const context = await getUserContext(req);
    const reply = await callAiProvider(message, req.body.history, context);

    res.json({ success: true, reply, role: context.role });
  } catch (err) {
    console.error('[AI CHAT ERROR]', err.details || err.message);
    res.status(500).json({
      success: false,
      message: 'AI Chatbot me thodi samasya aayi hai. Kripya punah prayas karein.',
      reply: fallbackReply(req.body?.message || '', { role: req.user?.role || 'user' })
    });
  }
};
