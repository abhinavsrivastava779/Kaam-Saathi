const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ========================================
// Load Environment Variables
// ========================================

dotenv.config({
  path: path.join(__dirname, '../.env')
});

const app = express();

// ========================================
// Database
// ========================================

connectDB();

// ========================================
// CORS Configuration
// ========================================

const allowedOrigins = [
  'https://kaammanch.netlify.app',
  'https://heroic-madeleine-f5cba5.netlify.app'
];

// Add FRONTEND_URL from Render Environment Variables if present
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {

    // Allow requests without Origin
    // Postman / server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    // Allow localhost development
    if (
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    // Allow production frontend
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn('========================================');
    console.warn('CORS BLOCKED ORIGIN:', origin);
    console.warn('========================================');

    return callback(
      new Error(`Not allowed by CORS: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],

  optionsSuccessStatus: 204
};

// ========================================
// Apply CORS BEFORE API ROUTES
// ========================================

app.use(cors(corsOptions));

// Explicit OPTIONS / Preflight handling
app.options('*', cors(corsOptions));

// ========================================
// Body Parsers
// ========================================

app.use(
  express.json({
    limit: '20mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '20mb'
  })
);

// ========================================
// Health Check
// ========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    appName: 'Kaam Manch (काम मंच)',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// API Routes
// ========================================

app.use(
  '/api/auth',
  require('./routes/authRoutes')
);

app.use(
  '/api/workers',
  require('./routes/workerRoutes')
);

app.use(
  '/api/employers',
  require('./routes/employerRoutes')
);

app.use(
  '/api/location',
  require('./routes/locationRoutes')
);

app.use(
  '/api/whatsapp',
  require('./routes/whatsappRoutes')
);

app.use(
  '/api/ivr',
  require('./routes/ivrRoutes')
);

app.use(
  '/api/helpline',
  require('./routes/helplineRoutes')
);

app.use(
  '/api/ai',
  require('./routes/aiRoutes')
);

app.use(
  '/api/admin',
  require('./routes/adminRoutes')
);

// ========================================
// Error Handler
// ========================================

app.use(errorHandler);

// ========================================
// Start Server
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 Kaam Manch Backend API Server');
  console.log('========================================');
  console.log(`📍 Port: ${PORT}`);
  console.log('');
  console.log('Allowed Frontend Origins:');

  allowedOrigins.forEach((origin) => {
    console.log(`✅ ${origin}`);
  });

  console.log('========================================');
  console.log('');
});