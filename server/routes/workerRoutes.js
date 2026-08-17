const express = require('express');
const router = express.Router();
const {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  updateAvailability,
  deleteWorker,
  addRating,
  getMyProfile,
  submitKyc
} = require('../controllers/workerController');
const { getNearbyWorkers } = require('../controllers/locationController');
const auth=require('../middleware/auth');

// Explicit route for location searching
router.get('/nearby', getNearbyWorkers);

router.get('/me/profile',auth,getMyProfile);
router.post('/', createWorker);
router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.post('/:id/rating', auth, addRating);
router.patch('/:id', updateWorker);
router.patch('/:id/availability', updateAvailability);
router.post('/:id/kyc',auth,submitKyc);
router.delete('/:id', deleteWorker);

module.exports = router;
