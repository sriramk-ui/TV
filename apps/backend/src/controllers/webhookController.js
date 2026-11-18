const { handleVoiceWebhook } = require('../services/outboxService');

async function handleMSG91Webhook(req, res, next) {
  try {
    const payload = req.body;
    console.log('[WEBHOOK RECEIVED] MSG91:', JSON.stringify(payload));

    const result = await handleVoiceWebhook(payload);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(200).json({ success: false, error: err.message });
  }
}

module.exports = {
  handleMSG91Webhook
};
