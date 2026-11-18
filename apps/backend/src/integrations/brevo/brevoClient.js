const axios = require('axios');
const env = require('../../config/env');

async function sendEmail({
  to,
  toName = '',
  subject,
  htmlContent,
  textContent = '',
  attachments = []
}) {
  if (env.BREVO_SANDBOX_MODE || !env.BREVO_ENABLED) {
    console.log(`[BREVO SANDBOX] Dispatching email to: ${to} | Subject: "${subject}"`);
    return {
      success: true,
      messageId: `sandbox-brevo-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      mode: 'sandbox'
    };
  }

  try {
    const payload = {
      sender: {
        name: env.BREVO_SENDER_NAME,
        email: env.BREVO_SENDER_EMAIL
      },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent,
      textContent: textContent || subject
    };

    if (attachments.length > 0) {
      payload.attachment = attachments;
    }

    const res = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return {
      success: true,
      messageId: res.data.messageId,
      mode: 'live'
    };
  } catch (err) {
    console.error('[BREVO ERROR]', err.response?.data || err.message);
    throw new Error(`Brevo API delivery failed: ${err.response?.data?.message || err.message}`);
  }
}

module.exports = {
  sendEmail
};
