const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.options('*', cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    appName: 'Kaam Saathi (काम साथी)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/employers', require('./routes/employerRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));
app.use('/api/ivr', require('./routes/ivrRoutes'));
app.use('/api/helpline', require('./routes/helplineRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Kaam Saathi Backend API Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
