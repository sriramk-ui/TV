const axios = require('axios');
const env = require('../../config/env');
const { normalizeE164 } = require('@sankara/shared');

/**
 * Triggers an outbound automated voice call via MSG91 Voice Campaign API.
 */
async function initiateVoiceCall({
  toNumber,
  recipientName,
  showTitle,
  shootDate,
  reportingTime,
  roleTitle,
  venue,
  voiceLanguage = 'ta',
  internalCallId
}) {
  const normalizedPhone = normalizeE164(toNumber);
  if (!normalizedPhone) {
    throw new Error(`Invalid recipient phone number for voice dispatch: "${toNumber}"`);
  }

  // Voice Script formatting (Zero PAF amounts)
  const scriptTa = `வணக்கம் ${recipientName}. இது ஸ்ரீ சங்கரா தொலைக்காட்சி தயாரிப்பு பிரிவு. உங்கள் ${showTitle} படப்பிடிப்பு ${shootDate} அன்று உறுதிசெய்யப்பட்டுள்ளது. உங்கள் பொறுப்பு: ${roleTitle}. காலை ${reportingTime} மணிக்கு ${venue} இடத்திற்கு வரவும். உறுதிப்படுத்த ஆம் அல்லது முரண்பாடு இருந்தால் தெரிவிக்கவும்.`;
  const scriptEn = `Hello ${recipientName}. This is Sri Sankara TV Production Desk. Your shoot for ${showTitle} is approved for ${shootDate}. You are assigned as ${roleTitle}. Please report at ${reportingTime} to ${venue}. Please confirm or report any scheduling conflict.`;
  const message = voiceLanguage === 'en' ? scriptEn : scriptTa;

  if (env.MSG91_SANDBOX_MODE || !env.MSG91_ENABLED) {
    console.log(`[MSG91 SANDBOX] Outbound Voice Call to ${normalizedPhone} (${recipientName}): "${message}"`);
    return {
      success: true,
      attemptId: `msg91-att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mode: 'sandbox',
      script: message
    };
  }

  try {
    const payload = {
      campaign_id: env.MSG91_CALL_CAMPAIGN_ID,
      caller_id: env.MSG91_CALLER_NUMBER,
      to: normalizedPhone,
      message,
      language: voiceLanguage,
      custom_data: {
        internal_call_id: String(internalCallId)
      }
    };

    const res = await axios.post('https://api.msg91.com/api/v5/voice/call', payload, {
      headers: {
        authkey: env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return {
      success: true,
      attemptId: res.data.request_id || `msg91-${Date.now()}`,
      mode: 'live',
      script: message
    };
  } catch (err) {
    console.error('[MSG91 ERROR]', err.response?.data || err.message);
    throw new Error(`MSG91 Voice Call failed: ${err.response?.data?.message || err.message}`);
  }
}

module.exports = {
  initiateVoiceCall
};
