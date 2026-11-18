const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_settings'
    },
    finance_emails: {
      type: [String],
      default: ['accounts@srisankaratv.com']
    },
    brevo_enabled: {
      type: Boolean,
      default: false
    },
    brevo_api_key: {
      type: String,
      default: ''
    },
    brevo_sender_email: {
      type: String,
      default: 'production@srisankaratv.com'
    },
    brevo_sender_name: {
      type: String,
      default: 'Sri Sankara TV Production Desk'
    },
    msg91_enabled: {
      type: Boolean,
      default: false
    },
    msg91_auth_key: {
      type: String,
      default: ''
    },
    msg91_campaign_id: {
      type: String,
      default: ''
    },
    msg91_caller_number: {
      type: String,
      default: '+914424991234'
    },
    calendar_provider: {
      type: String,
      enum: ['google', 'outlook'],
      default: 'google'
    },
    calendar_enabled: {
      type: Boolean,
      default: false
    },
    cron_hourly_reminders_enabled: {
      type: Boolean,
      default: true
    },
    travel_buffer_minutes: {
      type: Number,
      default: 60
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
