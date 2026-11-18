const dotenv = require('dotenv');
const path = require('path');

// Load .env from root if available, otherwise from current directory
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sankara_production',
  MONGODB_USE_MEMORY_FALLBACK: process.env.MONGODB_USE_MEMORY_FALLBACK !== 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_sri_sankara_production_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_sri_sankara_production_2026',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001').split(','),
  
  // Brevo
  BREVO_API_KEY: process.env.BREVO_API_KEY || 'sandbox_brevo_key',
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'Sri Sankara TV Production Desk',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'production@srisankaratv.com',
  BREVO_ENABLED: process.env.BREVO_ENABLED === 'true',
  BREVO_SANDBOX_MODE: process.env.BREVO_SANDBOX_MODE !== 'false',

  // MSG91
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || 'sandbox_msg91_key',
  MSG91_CALL_CAMPAIGN_ID: process.env.MSG91_CALL_CAMPAIGN_ID || 'campaign_production_call',
  MSG91_CALLER_NUMBER: process.env.MSG91_CALLER_NUMBER || '+914424991234',
  MSG91_WEBHOOK_SECRET: process.env.MSG91_WEBHOOK_SECRET || 'msg91_webhook_secret_key',
  MSG91_ENABLED: process.env.MSG91_ENABLED === 'true',
  MSG91_SANDBOX_MODE: process.env.MSG91_SANDBOX_MODE !== 'false',

  // Calendar
  CALENDAR_PROVIDER: process.env.CALENDAR_PROVIDER || 'google',
  CALENDAR_ENABLED: process.env.CALENDAR_ENABLED === 'true',
  CALENDAR_SANDBOX_MODE: process.env.CALENDAR_SANDBOX_MODE !== 'false',

  // Cron
  CRON_HOURLY_REMINDERS_ENABLED: process.env.CRON_HOURLY_REMINDERS_ENABLED !== 'false',
  CRON_VOICE_OUTBOX_ENABLED: process.env.CRON_VOICE_OUTBOX_ENABLED !== 'false',
  REMINDER_INTERVAL_MINUTES: parseInt(process.env.CRON_REMINDER_INTERVAL_MINUTES, 10) || 60,
  VOICE_RETRY_DELAY_MINUTES: parseInt(process.env.VOICE_RETRY_DELAY_MINUTES, 10) || 30,
  MAX_VOICE_ATTEMPTS: parseInt(process.env.MAX_VOICE_ATTEMPTS, 10) || 2
};
