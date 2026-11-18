const OutboxJob = require('../models/OutboxJob');
const User = require('../models/User');
const ShootOccurrence = require('../models/ShootOccurrence');
const { sendEmail } = require('../integrations/brevo/brevoClient');
const { initiateVoiceCall } = require('../integrations/msg91/msg91Client');
const { syncCalendarAppointment } = require('../integrations/calendar/calendarService');
const { OUTBOX_CHANNELS, OUTBOX_JOB_STATE, CALL_STATES } = require('@sankara/constants');

/**
 * Enqueues a job into the durable transactional outbox.
 */
async function enqueueOutboxJob({
  idempotencyKey,
  channel,
  eventType,
  shootId = null,
  occurrenceId = null,
  recipientId = null,
  recipientAddress = '',
  payload = {},
  dueAt = new Date(),
  attemptNumber = 1
}) {
  try {
    const job = await OutboxJob.findOneAndUpdate(
      { idempotency_key: idempotencyKey },
      {
        $setOnInsert: {
          idempotency_key: idempotencyKey,
          channel,
          event_type: eventType,
          shoot_id: shootId,
          occurrence_id: occurrenceId,
          recipient_id: recipientId,
          recipient_address: recipientAddress,
          payload,
          state: OUTBOX_JOB_STATE.PENDING,
          call_state: channel === OUTBOX_CHANNELS.MSG91_VOICE ? CALL_STATES.QUEUED : undefined,
          attempts: 0,
          attempt_number: attemptNumber,
          next_attempt_at: dueAt
        }
      },
      { upsert: true, new: true }
    );
    return job;
  } catch (err) {
    console.error('Failed to enqueue outbox job:', err.message);
    throw err;
  }
}

/**
 * Sweeps and executes due outbox jobs.
 */
async function processDueOutboxJobs() {
  const now = new Date();

  // Find up to 20 due pending or retryable jobs
  const dueJobs = await OutboxJob.find({
    state: { $in: [OUTBOX_JOB_STATE.PENDING, OUTBOX_JOB_STATE.RETRYABLE_FAILURE] },
    next_attempt_at: { $lte: now }
  }).limit(20);

  for (const job of dueJobs) {
    try {
      job.state = OUTBOX_JOB_STATE.SENDING;
      job.attempts += 1;
      await job.save();

      if (job.channel === OUTBOX_CHANNELS.BREVO_EMAIL) {
        const result = await sendEmail({
          to: job.recipient_address,
          toName: job.payload.recipient_name,
          subject: job.payload.subject,
          htmlContent: job.payload.html,
          textContent: job.payload.text
        });
        job.state = OUTBOX_JOB_STATE.DELIVERED;
        job.provider_reference = result.messageId;
        job.delivered_at = new Date();
        job.last_error = null;
        await job.save();
      } else if (job.channel === OUTBOX_CHANNELS.MSG91_VOICE) {
        // Verify recipient voice consent before calling
        const recipient = await User.findById(job.recipient_id);
        if (!recipient || !recipient.voice_opt_in || !recipient.active) {
          console.log(`Voice call suppressed for ${job.recipient_address}: Consent revoked or account inactive.`);
          job.state = OUTBOX_JOB_STATE.CANCELLED;
          job.call_state = CALL_STATES.CANCELLED;
          job.last_error = 'Consent not granted or account inactive';
          await job.save();
          continue;
        }

        job.call_state = CALL_STATES.DIALING;
        const result = await initiateVoiceCall({
          toNumber: job.recipient_address,
          recipientName: recipient.name,
          showTitle: job.payload.show_title,
          shootDate: job.payload.shoot_date,
          reportingTime: job.payload.reporting_time,
          roleTitle: job.payload.role_title,
          venue: job.payload.venue,
          voiceLanguage: recipient.voice_language || 'ta',
          internalCallId: job._id
        });

        job.state = OUTBOX_JOB_STATE.DELIVERED;
        job.call_state = CALL_STATES.CONNECTED;
        job.provider_reference = result.attemptId;
        job.delivered_at = new Date();
        await job.save();
      } else if (
        job.channel === OUTBOX_CHANNELS.GOOGLE_CALENDAR ||
        job.channel === OUTBOX_CHANNELS.OUTLOOK_CALENDAR
      ) {
        const result = await syncCalendarAppointment({
          occurrenceId: job.occurrence_id,
          userId: job.recipient_id,
          userEmail: job.recipient_address,
          showTitle: job.payload.show_title,
          venue: job.payload.venue,
          startAtUtc: new Date(job.payload.start_at_utc),
          endAtUtc: new Date(job.payload.end_at_utc),
          roleTitle: job.payload.role_title
        });
        job.state = OUTBOX_JOB_STATE.DELIVERED;
        job.provider_reference = result.externalEventId;
        job.delivered_at = new Date();
        job.last_error = null;
        await job.save();
      }
    } catch (err) {
      console.error(`Error processing job ${job._id}:`, err.message);
      job.last_error = err.message;
      if (job.attempts < job.max_attempts) {
        job.state = OUTBOX_JOB_STATE.RETRYABLE_FAILURE;
        job.next_attempt_at = new Date(Date.now() + 5 * 60 * 1000); // 5 min retry backoff
      } else {
        job.state = OUTBOX_JOB_STATE.PERMANENT_FAILURE;
      }
      await job.save();
    }
  }
}

/**
 * Handles incoming MSG91 Voice Webhook callbacks.
 * Enforces: attempt 1 no_answer -> 1 retry after 30 minutes. attempt 2 no_answer -> not_reached.
 */
async function handleVoiceWebhook(payload) {
  const { internal_call_id, status, user_acknowledged, conflict_reported } = payload;
  const job = await OutboxJob.findById(internal_call_id);

  if (!job) {
    return { ok: false, message: 'Job not found' };
  }

  console.log(`[MSG91 WEBHOOK] Job: ${job._id} Status: ${status}`);

  if (status === 'connected') {
    job.call_state = user_acknowledged ? CALL_STATES.ACKNOWLEDGED : CALL_STATES.CONNECTED;
    if (user_acknowledged) {
      // Update occurrence assignment response state
      await ShootOccurrence.updateOne(
        { _id: job.occurrence_id, 'assignments.user_id': job.recipient_id },
        {
          $set: {
            'assignments.$.response_state': 'acknowledged',
            'assignments.$.acknowledged_at': new Date()
          }
        }
      );
    }
    if (conflict_reported) {
      job.call_state = CALL_STATES.ISSUE_REPORTED;
      await ShootOccurrence.updateOne(
        { _id: job.occurrence_id, 'assignments.user_id': job.recipient_id },
        {
          $set: {
            'assignments.$.response_state': 'conflict_reported',
            'assignments.$.conflict_notes': 'Reported via automated voice call'
          }
        }
      );
    }
    await job.save();
    return { ok: true, state: job.call_state };
  }

  if (status === 'no_answer') {
    job.call_state = CALL_STATES.NO_ANSWER;
    await job.save();

    // If this was attempt 1, schedule Attempt 2 for +30 minutes
    if (job.attempt_number === 1) {
      const retryKey = `${job.idempotency_key}:retry-2`;
      const retryDueAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes exactly

      await enqueueOutboxJob({
        idempotencyKey: retryKey,
        channel: OUTBOX_CHANNELS.MSG91_VOICE,
        eventType: job.event_type,
        shootId: job.shoot_id,
        occurrenceId: job.occurrence_id,
        recipientId: job.recipient_id,
        recipientAddress: job.recipient_address,
        payload: job.payload,
        dueAt: retryDueAt,
        attemptNumber: 2
      });
      console.log(`Scheduled 30-min voice retry for ${job.recipient_address} at ${retryDueAt.toISOString()}`);
    } else {
      // Attempt 2 failed: mark not_reached
      job.call_state = CALL_STATES.NOT_REACHED;
      await job.save();
      console.warn(`Voice call not reached after 2 attempts for ${job.recipient_address}. Alert logged for Production Head.`);
    }
  }

  return { ok: true, state: job.call_state };
}

module.exports = {
  enqueueOutboxJob,
  processDueOutboxJobs,
  handleVoiceWebhook
};
