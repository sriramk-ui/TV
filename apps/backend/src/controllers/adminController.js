const SystemSettings = require('../models/SystemSettings');
const ActivityLog = require('../models/ActivityLog');
const OutboxJob = require('../models/OutboxJob');
const User = require('../models/User');
const ShootRequest = require('../models/ShootRequest');
const { logActivity } = require('../services/auditService');

async function getSettings(req, res, next) {
  try {
    let settings = await SystemSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await SystemSettings.create({ key: 'global_settings' });
    }
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const {
      finance_emails,
      brevo_enabled,
      brevo_sender_email,
      brevo_sender_name,
      msg91_enabled,
      msg91_caller_number,
      calendar_provider,
      calendar_enabled,
      travel_buffer_minutes
    } = req.body;

    let settings = await SystemSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new SystemSettings({ key: 'global_settings' });
    }

    if (finance_emails !== undefined) {
      settings.finance_emails = Array.isArray(finance_emails)
        ? finance_emails
        : String(finance_emails).split(/[;,\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    }
    if (brevo_enabled !== undefined) settings.brevo_enabled = Boolean(brevo_enabled);
    if (brevo_sender_email) settings.brevo_sender_email = brevo_sender_email;
    if (brevo_sender_name) settings.brevo_sender_name = brevo_sender_name;
    if (msg91_enabled !== undefined) settings.msg91_enabled = Boolean(msg91_enabled);
    if (msg91_caller_number) settings.msg91_caller_number = msg91_caller_number;
    if (calendar_provider) settings.calendar_provider = calendar_provider;
    if (calendar_enabled !== undefined) settings.calendar_enabled = Boolean(calendar_enabled);
    if (travel_buffer_minutes !== undefined) settings.travel_buffer_minutes = Number(travel_buffer_minutes) || 60;

    await settings.save();

    await logActivity({
      actor: req.user,
      action: 'SYSTEM_SETTINGS_UPDATED',
      entityType: 'SystemSettings',
      entityId: settings._id,
      details: { finance_emails: settings.finance_emails },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: settings,
      message: 'System settings updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const logs = await ActivityLog.find().sort({ created_at: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
}

async function getOutboxJobs(req, res, next) {
  try {
    const { channel, state } = req.query;
    const query = {};
    if (channel) query.channel = channel;
    if (state) query.state = state;

    const jobs = await OutboxJob.find(query).sort({ created_at: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (err) {
    next(err);
  }
}

async function retryOutboxJob(req, res, next) {
  try {
    const { id } = req.params;
    const job = await OutboxJob.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Outbox job not found.' }
      });
    }

    job.state = 'pending';
    job.next_attempt_at = new Date();
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Outbox job queued for immediate retry.'
    });
  } catch (err) {
    next(err);
  }
}

async function getSystemHealth(req, res, next) {
  try {
    const totalUsers = await User.countDocuments({ active: true });
    const totalShoots = await ShootRequest.countDocuments();
    const pendingJobs = await OutboxJob.countDocuments({ state: 'pending' });
    const failedJobs = await OutboxJob.countDocuments({ state: { $in: ['retryable_failure', 'permanent_failure'] } });

    return res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        metrics: {
          totalActiveUsers: totalUsers,
          totalShoots,
          pendingJobs,
          failedJobs
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings,
  getAuditLogs,
  getOutboxJobs,
  retryOutboxJob,
  getSystemHealth
};
