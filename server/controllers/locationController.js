const Worker = require('../models/Worker');
const whatsappProvider = require('../services/whatsapp');

// Haversine formula calculation in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(2)); // return in KM with 2 decimals
}

// @desc Get nearby workers using Haversine calculation
// @route GET /api/workers/nearby
exports.getNearbyWorkers = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance, skill, availability, area } = req.query;

    const lat = latitude ? parseFloat(latitude) : null;
    const long = longitude ? parseFloat(longitude) : null;
    const maxDist = maxDistance && maxDistance !== 'all' ? parseFloat(maxDistance) : null;

    const query = {};

    if (skill && skill !== 'all' && skill !== 'सभी') {
      query.skill = { $regex: skill, $options: 'i' };
    }

    if (availability !== undefined && availability !== 'all') {
      query.availability = availability === 'true' || availability === '1';
    }

    // Manual area/city searches should not return workers from unrelated places.
    // Match both the worker's area and city so inputs like "Shikohabad" work
    // even when the worker's locality is stored in either field.
    if (area && area.trim()) {
      const areaRegex = { $regex: area.trim(), $options: 'i' };
      query.$or = [{ area: areaRegex }, { city: areaRegex }];
    }

    let workers = await Worker.find(query);

    // Map distance if coordinates provided
    let results = workers.map(w => {
      const doc = w.toObject();
      if (lat !== null && long !== null && doc.location && doc.location.lat && doc.location.long) {
        doc.distanceKm = calculateHaversineDistance(lat, long, doc.location.lat, doc.location.long);
      } else {
        doc.distanceKm = null;
      }
      return doc;
    });

    // Filter by max distance if requested
    if (maxDist !== null && lat !== null && long !== null) {
      results = results.filter(w => w.distanceKm !== null && w.distanceKm <= maxDist);
    }

    // Sort: Available workers first, then nearest distance (if distance available)
    results.sort((a, b) => {
      if (a.availability !== b.availability) {
        return a.availability ? -1 : 1;
      }
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

    res.status(200).json({
      success: true,
      count: results.length,
      employerCoordinates: lat !== null && long !== null ? { lat, long } : null,
      workers: results
    });
  } catch (err) {
    next(err);
  }
};


// @desc Resolve a manually entered place/area into GPS coordinates
// @route GET /api/location/search
exports.searchLocation = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ success: false, message: 'इलाका या शहर डालें।' });
    }

    const knownPlaces = {
      shikohabad: { lat: 27.1084, long: 78.5845, city: 'Shikohabad', state: 'Uttar Pradesh' },
      firozabad: { lat: 27.1592, long: 78.3957, city: 'Firozabad', state: 'Uttar Pradesh' },
      jasrana: { lat: 27.2483, long: 78.5898, city: 'Jasrana', state: 'Uttar Pradesh' },
      tundla: { lat: 27.2064, long: 78.2415, city: 'Tundla', state: 'Uttar Pradesh' },
      etmadpur: { lat: 27.2341, long: 78.2045, city: 'Etmadpur', state: 'Uttar Pradesh' },
      agra: { lat: 27.1767, long: 78.0081, city: 'Agra', state: 'Uttar Pradesh' },
      mainpuri: { lat: 27.2312, long: 79.0252, city: 'Mainpuri', state: 'Uttar Pradesh' },
      mathura: { lat: 27.4924, long: 77.6737, city: 'Mathura', state: 'Uttar Pradesh' },
      vrindavan: { lat: 27.5650, long: 77.6593, city: 'Vrindavan', state: 'Uttar Pradesh' },
      'krishna nagar mathura': { lat: 27.4924, long: 77.6737, area: 'Krishna Nagar', city: 'Mathura', state: 'Uttar Pradesh' },
    };

    const normalized = q.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, ' ').trim();
    const direct = knownPlaces[normalized];
    if (direct) {
      return res.json({ success: true, ...direct, displayName: `${direct.city}, ${direct.state}` });
    }

    // Small Hindi aliases for common demo searches.
    const aliases = {
      'शिकोहाबाद': 'shikohabad',
      'फिरोजाबाद': 'firozabad',
      'जसराना': 'jasrana',
      'टूंडला': 'tundla',
      'एत्मादपुर': 'etmadpur',
      'आगरा': 'agra',
      'मैनपुरी': 'mainpuri',
      'मथुरा': 'mathura',
      'वृंदावन': 'vrindavan',
      'कृष्णा नगर मथुरा': 'krishna nagar mathura',
      'कृष्ण नगर मथुरा': 'krishna nagar mathura'
    };
    const alias = aliases[q.trim().toLowerCase()];
    if (alias && knownPlaces[alias]) {
      return res.json({ success: true, ...knownPlaces[alias], displayName: `${knownPlaces[alias].city}, ${knownPlaces[alias].state}` });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=in&q=${encodeURIComponent(q)}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Kaam-Saathi-SIH-2026/1.0' } });
    if (!response.ok) throw new Error(`Location search service returned ${response.status}`);
    const data = await response.json();
    if (!data.length) {
      return res.status(404).json({ success: false, message: 'यह इलाका/शहर नहीं मिला।' });
    }

    const item = data[0];
    const address = item.address || {};
    const city = address.city || address.town || address.municipality || address.village || address.county || '';
    const state = address.state || '';
    const area = address.neighbourhood || address.suburb || address.village || address.hamlet || address.locality || '';

    res.json({
      success: true,
      lat: Number(item.lat),
      long: Number(item.lon),
      area,
      city,
      state,
      displayName: item.display_name || ''
    });
  } catch (err) {
    next(err);
  }
};

// @desc Reverse geocode GPS coordinates into area/city/state
// @route GET /api/location/reverse
exports.reverseGeocode = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon ?? req.query.long);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'सही GPS coordinates नहीं मिले।'
      });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Kaam-Saathi-SIH-2026/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding service returned ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    // Prefer the most local locality available, then fall back to town/city.
    const area = address.neighbourhood ||
      address.suburb ||
      address.village ||
      address.hamlet ||
      address.locality ||
      address.residential ||
      address.city_district ||
      address.town ||
      address.city ||
      '';

    const city = address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      address.county ||
      '';

    const state = address.state || '';

    res.json({
      success: true,
      area,
      city,
      state,
      displayName: data.display_name || ''
    });
  } catch (err) {
    next(err);
  }
};

// @desc Generate share location URL for WhatsApp / SMS
// @route POST /api/location/share
exports.shareLocation = async (req, res, next) => {
  try {
    const { workerPhone, employerLat, employerLong, customNote } = req.body;

    if (!employerLat || !employerLong) {
      return res.status(400).json({
        success: false,
        message: 'लोकेशन नहीं मिल पाई। कृपया फोन की Location चालू करें।'
      });
    }

    const mapsUrl = `https://www.google.com/maps?q=${employerLat},${employerLong}`;
    const noteText = customNote ? ` (${customNote})` : '';
    const messageText = `नमस्ते, मुझे काम के लिए आपकी मदद चाहिए। यह मेरी लोकेशन है: ${mapsUrl}${noteText}`;

    const cleanPhone = workerPhone ? String(workerPhone).replace(/\D/g, '') : '';
    const normalizedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : workerPhone;
    const whatsappUrl = whatsappProvider.generateShareUrl(normalizedPhone, messageText);
    const smsUrl = `sms:${normalizedPhone || ''}?body=${encodeURIComponent(messageText)}`;

    res.status(200).json({
      success: true,
      mapsUrl,
      messageText,
      whatsappUrl,
      smsUrl
    });
  } catch (err) {
    next(err);
  }
};
