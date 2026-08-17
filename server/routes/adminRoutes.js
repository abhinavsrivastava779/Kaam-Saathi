const express = require('express');
const router = express.Router();
const { login, getStats, getKyc, updateKyc } = require('../controllers/adminController');
const { createWorker, updateWorker, deleteWorker, updateAvailability } = require('../controllers/workerController');
const adminAuth = require('../middleware/adminAuth');

router.post('/login', login);
router.use(adminAuth);
router.get('/stats', getStats);
router.get('/kyc-submissions', require('../controllers/adminController').getKycSubmissions);
router.get('/users', require('../controllers/adminController').getUsers);
router.get('/users/:type/:id', require('../controllers/adminController').getUserDetails);
router.get('/workers/:id/kyc',getKyc);router.patch('/workers/:id/kyc',updateKyc);
router.post('/workers', createWorker);
router.patch('/workers/:id', updateWorker);
router.patch('/workers/:id/availability', updateAvailability);
router.delete('/workers/:id', deleteWorker);

module.exports = router;
