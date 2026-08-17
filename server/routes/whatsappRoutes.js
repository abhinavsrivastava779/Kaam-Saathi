const express = require('express');
const router = express.Router();
const { webhook, processMessage } = require('../controllers/whatsappController');

router.post('/webhook', webhook);
router.post('/process', processMessage);

module.exports = router;
