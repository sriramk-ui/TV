/**
 * @sankara/constants
 * Central constants, enums, and system definitions for Sri Sankara TV Production Portal.
 */

const ROLES = Object.freeze({
  CMO: 'cmo',
  PRODUCTION_HEAD: 'production_head',
  EP: 'ep',
  ACCOUNTS: 'accounts',
  CREW: 'crew'
});

const ROLE_LABELS = Object.freeze({
  [ROLES.CMO]: 'Chief Managing Officer / Admin',
  [ROLES.PRODUCTION_HEAD]: 'Production Head',
  [ROLES.EP]: 'Executive Producer',
  [ROLES.ACCOUNTS]: 'Accounts & Finance',
  [ROLES.CREW]: 'Production Crew'
});

const CREW_ROLES = Object.freeze({
  PHOTOGRAPHER: 'photographer',
  TECHNICIAN: 'technician',
  EDITOR: 'editor',
  DRIVER: 'driver',
  SOUND_ENGINEER: 'sound_engineer',
  ASSISTANT: 'assistant',
  OTHER: 'other'
});

const CREW_ROLE_LABELS = Object.freeze({
  [CREW_ROLES.PHOTOGRAPHER]: 'Camera Operator / Photographer',
  [CREW_ROLES.TECHNICIAN]: 'Broadcast Technician',
  [CREW_ROLES.EDITOR]: 'Video Editor',
  [CREW_ROLES.DRIVER]: 'OB Van / Transport Driver',
  [CREW_ROLES.SOUND_ENGINEER]: 'Sound & Audio Engineer',
  [CREW_ROLES.ASSISTANT]: 'Production Assistant',
  [CREW_ROLES.OTHER]: 'Other Crew'
});

const SHOOT_STATUS = Object.freeze({
  REQUESTED: 'requested',
  CHANGES_REQUESTED: 'changes_requested',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  CANCELLED: 'cancelled'
});

const SHOOT_STATUS_LABELS = Object.freeze({
  [SHOOT_STATUS.REQUESTED]: 'Shoot Requested',
  [SHOOT_STATUS.CHANGES_REQUESTED]: 'Changes Requested',
  [SHOOT_STATUS.PENDING_APPROVAL]: 'Pending CMO Approval',
  [SHOOT_STATUS.APPROVED]: 'Approved & Published',
  [SHOOT_STATUS.CANCELLED]: 'Cancelled'
});

const PAF_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_CMO: 'pending_cmo',
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested'
});

const PAF_STATUS_LABELS = Object.freeze({
  [PAF_STATUS.DRAFT]: 'Draft Budget',
  [PAF_STATUS.PENDING_CMO]: 'Pending CMO Review',
  [PAF_STATUS.APPROVED]: 'Approved by CMO',
  [PAF_STATUS.CHANGES_REQUESTED]: 'Changes Requested'
});

const PAYMENT_MODES = Object.freeze({
  CASH: 'Cash',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
  COMPANY_EXPENSE: 'Company Voucher'
});

const OUTBOX_CHANNELS = Object.freeze({
  BREVO_EMAIL: 'brevo_email',
  MSG91_VOICE: 'msg91_voice',
  GOOGLE_CALENDAR: 'google_calendar',
  OUTLOOK_CALENDAR: 'outlook_calendar'
});

const OUTBOX_JOB_STATE = Object.freeze({
  PENDING: 'pending',
  SENDING: 'sending',
  DELIVERED: 'delivered',
  RETRYABLE_FAILURE: 'retryable_failure',
  PERMANENT_FAILURE: 'permanent_failure',
  CANCELLED: 'cancelled',
  AWAITING_CONFIGURATION: 'awaiting_configuration'
});

const CALL_STATES = Object.freeze({
  QUEUED: 'queued',
  SENDING: 'sending',
  DIALING: 'dialing',
  CONNECTED: 'connected',
  ACKNOWLEDGED: 'acknowledged',
  ISSUE_REPORTED: 'issue_reported',
  NO_ANSWER: 'no_answer',
  BUSY: 'busy',
  FAILED: 'failed',
  NOT_REACHED: 'not_reached',
  CANCELLED: 'cancelled'
});

const ACK_STATES = Object.freeze({
  PENDING: 'pending',
  ACKNOWLEDGED: 'acknowledged',
  CONFLICT_REPORTED: 'conflict_reported'
});

const SHOOT_CATEGORIES = Object.freeze({
  STUDIO: 'studio',
  TEMPLE_OB: 'temple_ob',
  EVENT: 'event',
  DOCUMENTARY: 'documentary'
});

const SHOOT_CATEGORY_LABELS = Object.freeze({
  [SHOOT_CATEGORIES.STUDIO]: 'Studio Recording',
  [SHOOT_CATEGORIES.TEMPLE_OB]: 'Temple Outside Broadcast (OB)',
  [SHOOT_CATEGORIES.EVENT]: 'Special Festival / Event',
  [SHOOT_CATEGORIES.DOCUMENTARY]: 'Field Documentary'
});

const DEFAULT_BUFFER_MINUTES = 60; // 1 hour buffer before and after shoots for travel/prep

module.exports = {
  ROLES,
  ROLE_LABELS,
  CREW_ROLES,
  CREW_ROLE_LABELS,
  SHOOT_STATUS,
  SHOOT_STATUS_LABELS,
  PAF_STATUS,
  PAF_STATUS_LABELS,
  PAYMENT_MODES,
  OUTBOX_CHANNELS,
  OUTBOX_JOB_STATE,
  CALL_STATES,
  ACK_STATES,
  SHOOT_CATEGORIES,
  SHOOT_CATEGORY_LABELS,
  DEFAULT_BUFFER_MINUTES
};
