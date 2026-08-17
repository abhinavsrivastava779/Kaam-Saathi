const express = require('express');
const router = express.Router();
const { incoming, input, callback, createWorker } = require('../controllers/ivrController');

router.post('/incoming', incoming);
router.post('/input', input);
router.post('/callback', callback);
router.post('/create-worker', createWorker);

module.exports = router;
