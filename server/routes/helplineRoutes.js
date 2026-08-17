const express = require('express');
const router = express.Router();
const { getStatus } = require('../controllers/helplineController');

router.get('/status', getStatus);

module.exports = router;
