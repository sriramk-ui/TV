const cron = require('node-cron');
const ShootRequest = require('../models/ShootRequest');
const ApprovalRecord = require('../models/ApprovalRecord');
const User = require('../models/User');
const { enqueueOutboxJob, processDueOutboxJobs } = require('../services/outboxService');
const env = require('../config/env');
const { SHOOT_STATUS, OUTBOX_CHANNELS } = require('@sankara/constants');

/**
 * Initializes scheduled background cron tasks.
 */
function initializeCronScheduler() {
  console.log('Initializing Background Cron Scheduler...');

  // 1. Process Due Outbox Jobs every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      await processDueOutboxJobs();
    } catch (err) {
      console.error('Error in outbox sweep worker:', err.message);
    }
  });

  // 2. Hourly Pending CMO Approval Reminder (Runs every 5 minutes to check due packages)
  if (env.CRON_HOURLY_REMINDERS_ENABLED) {
    cron.schedule('*/5 * * * *', async () => {
      try {
        await checkAndSendCMOHourlyReminders();
      } catch (err) {
        console.error('Error in CMO hourly reminder job:', err.message);
      }
    });
  }
}

/**
 * Sends hourly reminders for packages pending CMO approval for >= 60 minutes.
 */
async function checkAndSendCMOHourlyReminders() {
  const pendingApprovals = await ApprovalRecord.find({ decision: 'pending' }).populate('shoot_id');
  if (pendingApprovals.length === 0) return;

  const now = new Date();
  const cmoUsers = await User.find({ role: 'cmo', active: true });
  if (cmoUsers.length === 0) return;

  for (const record of pendingApprovals) {
    const shoot = record.shoot_id;
    if (!shoot || shoot.status !== SHOOT_STATUS.PENDING_APPROVAL) continue;

    const lastReminder = record.last_reminder_at || record.submitted_at;
    const diffMinutes = (now.getTime() - new Date(lastReminder).getTime()) / (60 * 1000);

    // If pending for at least 60 minutes
    if (diffMinutes >= 60) {
      console.log(`[HOURLY REMINDER] Shoot ${shoot.series_code} pending for ${Math.round(diffMinutes)} minutes. Dispatching reminder to CMO...`);

      for (const cmo of cmoUsers) {
        const reminderKey = `cmo-rem-${shoot.series_code}-rev${record.revision}-${record.reminders_sent_count + 1}-${cmo._id}`;
        await enqueueOutboxJob({
          idempotencyKey: reminderKey,
          channel: OUTBOX_CHANNELS.BREVO_EMAIL,
          eventType: 'cmo_hourly_digest',
          shootId: shoot._id,
          recipientId: cmo._id,
          recipientAddress: cmo.email,
          payload: {
            recipient_name: cmo.name,
            subject: `[REMINDER] Shoot Approval Pending: ${shoot.title} (${shoot.series_code})`,
            html: `<p>This is an automated reminder that production package <strong>${shoot.title}</strong> (${shoot.series_code}) is still awaiting your decision.</p><p><a href="http://localhost:3000/approvals">Click here to Review and Approve</a></p>`,
            text: `Reminder: Shoot Approval Pending for ${shoot.title} (${shoot.series_code}). Please review in portal.`
          }
        });
      }

      record.reminders_sent_count += 1;
      record.last_reminder_at = now;
      await record.save();
    }
  }
}

module.exports = {
  initializeCronScheduler,
  checkAndSendCMOHourlyReminders
};
