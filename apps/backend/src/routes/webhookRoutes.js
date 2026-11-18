const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/msg91', webhookController.handleMSG91Webhook);

module.exports = router;
