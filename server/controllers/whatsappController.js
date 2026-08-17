const Worker = require('../models/Worker');

const normalizePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '').replace(/^91/, '');
  return digits.length === 10 ? `+91${digits}` : String(value || '');
};

const normalizeLocation = (location) => {
  if (!location) return null;
  const lat = Number(location.lat);
  const long = Number(location.long);
  if (!Number.isFinite(lat) || !Number.isFinite(long)) return null;

  return {
    lat,
    long,
    area: String(location.area || '').trim(),
    city: String(location.city || '').trim(),
    state: String(location.state || '').trim()
  };
};

const findPlace = async (query) => {
  const q = String(query || '').trim();
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=in&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Kaam-Saathi-SIH-2026/1.0' }
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (!data.length) return null;

  const address = data[0].address || {};
  const city = address.city || address.town || address.municipality || address.village || address.county || '';
  const area = address.neighbourhood ||
    address.suburb ||
    address.village ||
    address.hamlet ||
    address.locality ||
    address.residential ||
    address.city_district ||
    city ||
    '';
  const state = address.state || '';

  return {
    lat: Number(data[0].lat),
    long: Number(data[0].lon),
    area,
    city,
    state
  };
};

const locationLabel = (area, city) => {
  const a = String(area || '').trim();
  const c = String(city || '').trim();
  if (a && c && a.toLowerCase() !== c.toLowerCase()) return `${a}, ${c}`;
  return a || c || 'इलाका दर्ज नहीं किया';
};

exports.webhook = async (req, res, next) => {
  try {
    const { from, message, location } = req.body;
    const result = await require('../services/whatsapp').processIncomingMessage(from, message, location);
    res.status(200).json({ success: true, result });
  } catch (err) { next(err); }
};

exports.processMessage = async (req, res, next) => {
  try {
    const {
      step = 'START',
      phone = '',
      text = '',
      data = {},
      location = null
    } = req.body;

    const input = String(text || '').trim();
    let responseStep = step;
    let replyMessage = '';
    const updatedData = { ...data };

    switch (step) {
      case 'START':
        responseStep = 'ASK_PHONE';
        replyMessage = '📱 सबसे पहले अपना 10 अंकों का मोबाइल नंबर बताइए।';
        break;

      case 'ASK_PHONE': {
        const digits = input.replace(/\D/g, '').replace(/^91/, '');
        if (digits.length !== 10) {
          responseStep = 'ASK_PHONE';
          replyMessage = 'कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।';
          break;
        }
        updatedData.phone = normalizePhone(digits);
        responseStep = 'ASK_NAME';
        replyMessage = '👤 आपका नाम क्या है?';
        break;
      }

      case 'ASK_NAME':
        if (!input) {
          responseStep = 'ASK_NAME';
          replyMessage = 'कृपया अपना नाम बताइए।';
          break;
        }
        updatedData.name = input;
        responseStep = 'ASK_SKILL';
        replyMessage = 'आप कौन सा काम करते हैं?\n1. 🧱 मिस्त्री\n2. 🎨 पेंटर\n3. 🪚 बढ़ई\n4. 🔧 प्लंबर\n5. 🧹 सफाई\n6. 💪 मज़दूर\n7. 🍳 बावर्ची\n8. ⚡ इलेक्ट्रीशियन';
        break;

      case 'ASK_SKILL': {
        const skillOptions = {
          '1':'mistri','मिस्त्री':'mistri','2':'painter','पेंटर':'painter','3':'carpenter','बढ़ई':'carpenter',
          '4':'plumber','प्लंबर':'plumber','5':'cleaning','सफाई':'cleaning','6':'helper','मज़दूर':'helper',
          '7':'cook','बावर्ची':'cook','8':'electrician','इलेक्ट्रीशियन':'electrician'
        };
        const keyMatch = input.match(/[1-8]/);
        const key = keyMatch ? keyMatch[0] : '';
        updatedData.skill = skillOptions[input] || skillOptions[key] || '';
        if (!updatedData.skill) {
          responseStep = 'ASK_SKILL';
          replyMessage = 'कृपया 1 से 8 में कोई काम चुनें।';
          break;
        }
        responseStep = 'ASK_RATE';
        replyMessage = '💰 आपकी 1 दिन की दिहाड़ी कितनी है? (उदा. 700)';
        break;
      }

      case 'ASK_RATE': {
        const parsedRate = parseInt(input.replace(/[^0-9]/g, ''), 10);
        updatedData.dailyRate = Number.isFinite(parsedRate) && parsedRate >= 100 ? parsedRate : 700;
        responseStep = 'ASK_LOCATION';
        replyMessage = '📍 अब अपना इलाका चुनें। नीचे “📍 मेरी location लें” दबाकर GPS से इलाका + शहर (जैसे कृष्णा नगर, मथुरा) ले सकते हैं, या अपना इलाका लिख सकते हैं।';
        break;
      }

      case 'ASK_LOCATION': {
        const sharedLocation = normalizeLocation(location || data.location);
        let resolved = sharedLocation;

        if (!resolved && input) {
          try {
            resolved = await findPlace(input);
          } catch (locationError) {
            console.warn('Bot location search failed:', locationError.message);
          }
        }

        if (!resolved) {
          responseStep = 'ASK_LOCATION';
          replyMessage = '📍 Location नहीं मिली। “मेरी location लें” दबाएं या इलाका + शहर लिखें, जैसे “कृष्णा नगर, मथुरा”।';
          break;
        }

        updatedData.location = {
          lat: resolved.lat,
          long: resolved.long,
          area: resolved.area,
          city: resolved.city,
          state: resolved.state
        };
        updatedData.area = locationLabel(resolved.area, resolved.city);
        updatedData.city = resolved.city;
        updatedData.state = resolved.state;

        responseStep = 'ASK_AVAILABILITY';
        replyMessage = `📍 Location मिल गई: ${updatedData.area}\n\nक्या आप आज काम के लिए उपलब्ध हैं?\n1. हाँ\n2. नहीं`;
        break;
      }

      case 'ASK_AVAILABILITY': {
        updatedData.availability = ['1','हाँ','ha','yes','haan'].includes(input.toLowerCase());

        const worker = await Worker.findOneAndUpdate(
          { phone: normalizePhone(updatedData.phone) },
          {
            name: updatedData.name || 'Chatbot Worker',
            phone: normalizePhone(updatedData.phone),
            skill: updatedData.skill || 'helper',
            dailyRate: updatedData.dailyRate || 700,
            area: updatedData.area || 'इलाका दर्ज नहीं किया',
            city: updatedData.city || '',
            state: updatedData.state || '',
            location: updatedData.location?.lat !== undefined
              ? { lat: Number(updatedData.location.lat), long: Number(updatedData.location.long) }
              : undefined,
            availability: updatedData.availability,
            registrationSource: 'whatsapp'
          },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        responseStep = 'COMPLETED';
        replyMessage = `🎉 आपका प्रोफाइल काम साथी पर बन गया है!\n\nनाम: ${worker.name}\nमोबाइल: ${worker.phone}\nकाम: ${worker.skill}\nदिहाड़ी: ₹${worker.dailyRate}\nइलाका: ${locationLabel(worker.area, worker.city)}\n⭐ रेटिंग: नई प्रोफाइल`;
        break;
      }

      default:
        responseStep = 'START';
        replyMessage = 'शुरू करने के लिए संदेश भेजें।';
    }

    res.status(200).json({
      success: true,
      currentStep: responseStep,
      replyMessage,
      data: updatedData
    });
  } catch (err) {
    next(err);
  }
};
