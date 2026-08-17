const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');
const Worker = require('../models/Worker');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const sampleNames = [
  'रामेश कुमार', 'सुरेश यादव', 'राजेश मिस्त्री', 'बबलू सिंह', 'महेश चंद्र',
  'दिनेश वर्मा', 'सोनू कुशवाहा', 'मोनू राजपूत', 'राकेश शर्मा', 'सुनील निषाद',
  'अनिल प्रजापति', 'विक्रम जाटव', 'संतोष गुप्ता', 'विजय पाल', 'मनोज कुमार',
  'अजय सिंह', 'दीपक शर्मा', 'प्रमोद यादव', 'कमलेश लोधी', 'संजय कुमार',
  'रवि शंकर', 'अमित कुमार', 'जितेंद्र सिंह', 'पवन कुमार', 'धर्मेश पाल',
  'मुकेश यादव', 'सुभाष चंद', 'विकास मिस्त्री', 'आकाश पेंटर', 'विशाल सफाईवाला',
  'शिव कुमार', 'सुनील कुमार', 'अर्जुन सिंह', 'भीमसेन', 'करण शर्मा',
  'गोपाल यादव', 'हरिशंकर', 'सत्येंद्र कुमार', 'इंद्रपाल सिंह', 'वीरेंद्र यादव'
];

const skills = ['mistri', 'painter', 'carpenter', 'plumber', 'cleaning', 'helper', 'cook', 'electrician'];
const rates = [400, 500, 600, 700, 800, 1000];
const sources = ['app', 'whatsapp', 'missed-call', 'ivr', 'helpline'];

const locationPresets = [
  { area: 'Shikohabad', city: 'Shikohabad', lat: 27.1084, long: 78.5845 },
  { area: 'Firozabad', city: 'Firozabad', lat: 27.1592, long: 78.3957 },
  { area: 'Jasrana', city: 'Jasrana', lat: 27.2483, long: 78.5898 },
  { area: 'Tundla', city: 'Tundla', lat: 27.2064, long: 78.2415 },
  { area: 'Etmadpur', city: 'Etmadpur', lat: 27.2341, long: 78.2045 },
  { area: 'Agra', city: 'Agra', lat: 27.1767, long: 78.0081 },
  { area: 'Mainpuri', city: 'Mainpuri', lat: 27.2312, long: 79.0252 },
  { area: 'Krishna Nagar', city: 'Mathura', lat: 27.4924, long: 77.6737 }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing worker records...');
    await Worker.deleteMany({});

    console.log('[Seed] Generating 40 realistic workers...');
    const workers = [];

    for (let i = 0; i < 40; i++) {
      const name = sampleNames[i % sampleNames.length];
      const skill = skills[i % skills.length];
      const dailyRate = rates[i % rates.length];
      const loc = locationPresets[i % locationPresets.length];
      const city = loc.city || loc.area;
      const source = sources[i % sources.length];
      
      // Slight jitter on coordinates for hyperlocal variety
      const latJitter = (Math.random() - 0.5) * 0.04;
      const longJitter = (Math.random() - 0.5) * 0.04;

      workers.push({
        name,
        phone: `+9198${Math.floor(10000000 + Math.random() * 89999999)}`,
        photo: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80`,
        skill,
        dailyRate,
        area: loc.area,
        city,
        state: 'उत्तर प्रदेश',
        location: {
          lat: parseFloat((loc.lat + latJitter).toFixed(4)),
          long: parseFloat((loc.long + longJitter).toFixed(4))
        },
        availability: i % 4 !== 0, // ~75% available, ~25% unavailable
        ratingAverage: parseFloat((3.8 + ((i * 7) % 12) / 10).toFixed(1)),
        ratingCount: 6 + (i % 18),
        ratingSum: parseFloat((3.8 + ((i * 7) % 12) / 10).toFixed(1)) * (6 + (i % 18)),
        registrationSource: source
      });
    }

    await Worker.insertMany(workers);
    console.log(`\n========================================`);
    console.log(`✅ Seed Complete: 40 Workers Inserted Successfully!`);
    console.log(`========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
