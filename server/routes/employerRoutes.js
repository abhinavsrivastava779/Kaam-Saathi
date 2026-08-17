const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/employerController');

router.get('/me/profile', auth, controller.getMyProfile);
router.patch('/me/profile', auth, controller.updateMyProfile);

module.exports = router;
