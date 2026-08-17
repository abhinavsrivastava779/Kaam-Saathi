const express = require('express');
const router = express.Router();
const { shareLocation, reverseGeocode, searchLocation } = require('../controllers/locationController');

router.get('/reverse', reverseGeocode);
router.get('/search', searchLocation);
router.post('/share', shareLocation);

module.exports = router;
