const express = require('express');

const router = express.Router();

// =====================================================
// ADMIN CONTROLLER
// =====================================================

const {
  login,
  getStats,
  getKyc,
  updateKyc,
  getKycSubmissions,
  getUsers,
  getUserDetails
} = require('../controllers/adminController');

// =====================================================
// WORKER CONTROLLER
// =====================================================

const {
  createWorker,
  updateWorker,
  deleteWorker,
  updateAvailability
} = require('../controllers/workerController');

// =====================================================
// FEEDBACK CONTROLLER
// =====================================================

const {
  getFeedback,
  updateFeedbackStatus
} = require('../controllers/feedbackController');

// =====================================================
// REPORT CONTROLLER
// =====================================================

const {
  getWorkerReports,
  updateWorkerReport
} = require('../controllers/reportController');

// =====================================================
// ADMIN AUTH MIDDLEWARE
// =====================================================

const adminAuth = require('../middleware/adminAuth');


// =====================================================
// ADMIN LOGIN
// This route does NOT require adminAuth
// =====================================================

router.post('/login', login);


// =====================================================
// ALL ROUTES BELOW THIS REQUIRE ADMIN AUTHENTICATION
// =====================================================

router.use(adminAuth);


// =====================================================
// DASHBOARD / STATS
// =====================================================

router.get('/stats', getStats);


// =====================================================
// KYC
// =====================================================

router.get('/kyc-submissions', getKycSubmissions);

router.get('/workers/:id/kyc', getKyc);

router.patch('/workers/:id/kyc', updateKyc);


// =====================================================
// USERS
// =====================================================

router.get('/users', getUsers);

router.get('/users/:type/:id', getUserDetails);


// =====================================================
// WORKERS
// =====================================================

router.post('/workers', createWorker);

router.patch('/workers/:id', updateWorker);

router.patch(
  '/workers/:id/availability',
  updateAvailability
);

router.delete('/workers/:id', deleteWorker);


// =====================================================
// FEEDBACK
// =====================================================

// Get all feedback
router.get('/feedback', getFeedback);

// Update feedback status
router.patch(
  '/feedback/:id',
  updateFeedbackStatus
);


// =====================================================
// WORKER REPORTS
// =====================================================

// Get all worker reports
router.get('/reports', getWorkerReports);

// Update worker report
router.patch(
  '/reports/:id',
  updateWorkerReport
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;