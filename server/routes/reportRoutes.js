const express = require('express');
const router = express.Router();

const {
  createWorkerReport
} = require('../controllers/reportController');

const auth = require('../middleware/auth');

router.post('/worker', auth, createWorkerReport);

module.exports = router;