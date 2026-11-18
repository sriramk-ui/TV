const ShootRequest = require('../models/ShootRequest');
const ShootOccurrence = require('../models/ShootOccurrence');
const PAF = require('../models/PAF');
const ApprovalRecord = require('../models/ApprovalRecord');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const { enqueueOutboxJob } = require('./outboxService');
const { validateCrewConflicts } = require('./conflictService');
const { formatINR, toRupees } = require('@sankara/shared');
const { SHOOT_STATUS, PAF_STATUS, OUTBOX_CHANNELS } = require('@sankara/constants');

/**
 * Submits the schedule and PAF as ONE package to the CMO.
 */
async function submitCombinedPackage(shootId, user) {
  const shoot = await ShootRequest.findById(shootId);
  if (!shoot) throw new Error('Shoot request not found.');

  // Check linked PAF
  const paf = await PAF.findOne({ shoot_id: shoot._id });
  if (!paf) {
    throw new Error('Please prepare and save the PAF budget before submitting for CMO approval.');
  }

  if (!paf.items || paf.items.length === 0) {
    throw new Error('PAF must contain at least one itemized expense before submission.');
  }

  // Check occurrences
  const occurrences = await ShootOccurrence.find({ shoot_id: shoot._id });
  if (occurrences.length === 0) {
    throw new Error('Shoot must have at least one date occurrence scheduled.');
  }

  // Verify all occurrences have at least one crew member assigned
  for (const occ of occurrences) {
    if (!occ.assignments || occ.assignments.length === 0) {
      throw new Error(`Occurrence on ${occ.shoot_date} has no crew assigned. Assign production team before submission.`);
    }

    // Run conflict check
    const conflictResult = await validateCrewConflicts({
      occurrenceId: occ._id,
      shootDate: occ.shoot_date,
      startAtUtc: occ.start_at_utc,
      endAtUtc: occ.end_at_utc,
      assignments: occ.assignments
    });

    if (conflictResult.hasConflict) {
      throw new Error(`Cannot submit: Unresolved crew conflict detected. ${conflictResult.conflicts[0].message}`);
    }
  }

  // Atomically update statuses
  shoot.status = SHOOT_STATUS.PENDING_APPROVAL;
  shoot.last_submitted_at = new Date();
  await shoot.save();

  await ShootOccurrence.updateMany(
    { shoot_id: shoot._id },
    { $set: { status: SHOOT_STATUS.PENDING_APPROVAL } }
  );

  paf.status = PAF_STATUS.PENDING_CMO;
  await paf.save();

  // Create pending approval record
  let approval = await ApprovalRecord.findOne({
    shoot_id: shoot._id,
    decision: 'pending'
  });

  if (!approval) {
    approval = await ApprovalRecord.create({
      shoot_id: shoot._id,
      series_code: shoot.series_code,
      revision: shoot.revision,
      decision: 'pending',
      submitted_at: new Date()
    });
  }

  // Find CMO users to dispatch initial email
  const cmoUsers = await User.find({ role: 'cmo', active: true });
  for (const cmo of cmoUsers) {
    const key = `cmo-sub-${shoot.series_code}-rev${shoot.revision}-${cmo._id}`;
    const totalRupees = formatINR(paf.estimated_total_paise);

    await enqueueOutboxJob({
      idempotencyKey: key,
      channel: OUTBOX_CHANNELS.BREVO_EMAIL,
      eventType: 'cmo_approval_required',
      shootId: shoot._id,
      recipientId: cmo._id,
      recipientAddress: cmo.email,
      payload: {
        recipient_name: cmo.name,
        subject: `[APPROVAL REQUIRED] ${shoot.title} (${shoot.series_code})`,
        html: `<h2>CMO Approval Required</h2><p>Production Head has submitted <strong>${shoot.title}</strong> (${shoot.series_code}) with estimated PAF budget: <strong>${totalRupees}</strong>.</p><p><a href="http://localhost:3000/approvals">Open Approval Center</a> to review and approve.</p>`,
        text: `CMO Approval Required: ${shoot.title} (${shoot.series_code}) - Budget: ${totalRupees}`
      }
    });
  }

  return { ok: true, message: 'Combined schedule and PAF submitted for CMO approval.' };
}

/**
 * CMO executes binding approval or requests changes.
 */
async function processCMODecision({ shootId, decision, reason = '', cmoUser }) {
  const shoot = await ShootRequest.findById(shootId);
  if (!shoot) throw new Error('Shoot request not found.');

  const paf = await PAF.findOne({ shoot_id: shoot._id });
  if (!paf) throw new Error('Associated PAF not found.');

  const occurrences = await ShootOccurrence.find({ shoot_id: shoot._id });

  if (decision === 'approve') {
    // 1. Mark shoot and occurrences approved
    shoot.status = SHOOT_STATUS.APPROVED;
    shoot.approved_at = new Date();
    shoot.approved_by = cmoUser._id;
    await shoot.save();

    await ShootOccurrence.updateMany(
      { shoot_id: shoot._id },
      { $set: { status: SHOOT_STATUS.APPROVED } }
    );

    // 2. Lock PAF and store approved snapshot
    paf.status = PAF_STATUS.APPROVED;
    paf.approved_at = new Date();
    paf.approved_by = cmoUser._id;
    paf.snapshot_json = {
      approved_by: cmoUser.name,
      approved_at: new Date().toISOString(),
      estimated_total_paise: paf.estimated_total_paise,
      estimated_total: toRupees(paf.estimated_total_paise),
      items: paf.items.map((it) => ({
        particulars: it.particulars,
        unit: it.unit,
        quantity: it.quantity,
        rate: toRupees(it.rate_paise),
        amount: toRupees(it.amount_paise),
        payment_mode: it.payment_mode
      }))
    };
    await paf.save();

    // 3. Record in ApprovalRecord
    await ApprovalRecord.create({
      shoot_id: shoot._id,
      series_code: shoot.series_code,
      revision: shoot.revision,
      actor_id: cmoUser._id,
      decision: 'approved',
      reason: 'Approved by CMO',
      approved_cost_paise: paf.estimated_total_paise,
      snapshot: paf.snapshot_json,
      decided_at: new Date()
    });

    // 4. FAN-OUT OUTBOX JOBS
    const settings = await SystemSettings.findOne({ key: 'global_settings' });
    const financeEmails = settings?.finance_emails || ['accounts@srisankaratv.com'];
    const totalRupees = formatINR(paf.estimated_total_paise);

    // 4A. Accounts Department Email Dispatch
    for (const fEmail of financeEmails) {
      const fKey = `finance-paf-${shoot.series_code}-rev${shoot.revision}-${fEmail}`;
      await enqueueOutboxJob({
        idempotencyKey: fKey,
        channel: OUTBOX_CHANNELS.BREVO_EMAIL,
        eventType: 'finance_paf_approved',
        shootId: shoot._id,
        recipientAddress: fEmail,
        payload: {
          recipient_name: 'Accounts & Finance Team',
          subject: `[APPROVED PAF] ${shoot.title} (${shoot.series_code})`,
          html: `<h2>Approved Production Approval Form</h2><p>CMO has approved production <strong>${shoot.title}</strong> (${shoot.series_code}).</p><p>Total Estimated Budget: <strong>${totalRupees}</strong></p><p><a href="http://localhost:3000/pafs">View Approved PAF Ledger</a></p>`,
          text: `Approved PAF: ${shoot.title} (${shoot.series_code}) - Approved Total: ${totalRupees}`
        }
      });
    }

    // 4B. Staff Assignment Emails, Voice Calls, and Calendar Appointments
    let voiceCallCount = 0;
    for (const occ of occurrences) {
      for (const assign of occ.assignments) {
        const staff = await User.findById(assign.user_id);
        if (!staff) continue;

        // Staff Email (Brevo) - zero PAF cost data
        const staffEmailKey = `staff-assign-${occ._id}-${staff._id}-rev${shoot.revision}`;
        await enqueueOutboxJob({
          idempotencyKey: staffEmailKey,
          channel: OUTBOX_CHANNELS.BREVO_EMAIL,
          eventType: 'shoot_assigned',
          shootId: shoot._id,
          occurrenceId: occ._id,
          recipientId: staff._id,
          recipientAddress: staff.email,
          payload: {
            recipient_name: staff.name,
            subject: `[ASSIGNMENT] Shoot: ${shoot.title} on ${occ.shoot_date}`,
            html: `<h3>Sri Sankara TV Shoot Assignment</h3><p>Hello <strong>${staff.name}</strong>,</p><p>You are assigned as <strong>${assign.role_title}</strong> for <strong>${shoot.title}</strong>.</p><ul><li><strong>Date:</strong> ${occ.shoot_date}</li><li><strong>Reporting Time:</strong> ${occ.reporting_time}</li><li><strong>Venue:</strong> ${occ.venue}</li></ul><p><a href="http://localhost:3000/dashboard">Acknowledge your assignment here</a>.</p>`,
            text: `Shoot assignment: ${shoot.title} on ${occ.shoot_date} as ${assign.role_title} at ${occ.venue}.`
          }
        });

        // Direct Calendar Sync
        const calKey = `cal-sync-${occ._id}-${staff._id}-rev${shoot.revision}`;
        await enqueueOutboxJob({
          idempotencyKey: calKey,
          channel: settings?.calendar_provider === 'outlook' ? OUTBOX_CHANNELS.OUTLOOK_CALENDAR : OUTBOX_CHANNELS.GOOGLE_CALENDAR,
          eventType: 'calendar_sync',
          shootId: shoot._id,
          occurrenceId: occ._id,
          recipientId: staff._id,
          recipientAddress: staff.email,
          payload: {
            show_title: shoot.title,
            venue: occ.venue,
            start_at_utc: occ.start_at_utc,
            end_at_utc: occ.end_at_utc,
            role_title: assign.role_title
          }
        });

        // Automated Voice Call (MSG91) if user has phone & opt-in consent
        if (staff.voice_opt_in && staff.phone_e164 && staff.active) {
          const voiceKey = `voice-call-${occ._id}-${staff._id}-att1-rev${shoot.revision}`;
          await enqueueOutboxJob({
            idempotencyKey: voiceKey,
            channel: OUTBOX_CHANNELS.MSG91_VOICE,
            eventType: 'voice_call_dispatch',
            shootId: shoot._id,
            occurrenceId: occ._id,
            recipientId: staff._id,
            recipientAddress: staff.phone_e164,
            payload: {
              show_title: shoot.title,
              shoot_date: occ.shoot_date,
              reporting_time: occ.reporting_time,
              role_title: assign.role_title,
              venue: occ.venue
            },
            attemptNumber: 1
          });
          voiceCallCount++;
        }
      }
    }

    return {
      ok: true,
      decision: 'approved',
      message: `Production "${shoot.title}" and PAF approved. Sent to Accounts, calendars synced, and ${voiceCallCount} voice calls queued.`
    };
  } else if (decision === 'changes_requested') {
    if (!reason.trim()) {
      throw new Error('A reason is mandatory when requesting changes.');
    }

    shoot.status = SHOOT_STATUS.CHANGES_REQUESTED;
    await shoot.save();

    await ShootOccurrence.updateMany(
      { shoot_id: shoot._id },
      { $set: { status: SHOOT_STATUS.CHANGES_REQUESTED } }
    );

    paf.status = PAF_STATUS.CHANGES_REQUESTED;
    paf.notes = `${paf.notes ? paf.notes + '\n' : ''}[CMO Feedback]: ${reason}`;
    await paf.save();

    await ApprovalRecord.create({
      shoot_id: shoot._id,
      series_code: shoot.series_code,
      revision: shoot.revision,
      actor_id: cmoUser._id,
      decision: 'changes_requested',
      reason,
      decided_at: new Date()
    });

    return {
      ok: true,
      decision: 'changes_requested',
      message: `Package returned to Production Head for modifications: "${reason}".`
    };
  } else {
    throw new Error(`Unsupported decision: "${decision}". Must be 'approve' or 'changes_requested'.`);
  }
}

module.exports = {
  submitCombinedPackage,
  processCMODecision
};
