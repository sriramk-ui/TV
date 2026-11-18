const mongoose = require('mongoose');
const { OUTBOX_CHANNELS, OUTBOX_JOB_STATE, CALL_STATES } = require('@sankara/constants');

const outboxJobSchema = new mongoose.Schema(
  {
    idempotency_key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    channel: {
      type: String,
      enum: Object.values(OUTBOX_CHANNELS),
      required: true,
      index: true
    },
    event_type: {
      type: String,
      required: true,
      index: true
    },
    shoot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShootRequest',
      default: null
    },
    occurrence_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShootOccurrence',
      default: null
    },
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    recipient_address: {
      type: String,
      default: ''
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    state: {
      type: String,
      enum: Object.values(OUTBOX_JOB_STATE),
      default: OUTBOX_JOB_STATE.PENDING,
      index: true
    },
    call_state: {
      type: String,
      enum: Object.values(CALL_STATES),
      default: CALL_STATES.QUEUED
    },
    attempts: {
      type: Number,
      default: 0
    },
    max_attempts: {
      type: Number,
      default: 2
    },
    attempt_number: {
      type: Number,
      default: 1
    },
    next_attempt_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    provider_reference: {
      type: String,
      default: null
    },
    last_error: {
      type: String,
      default: null
    },
    delivered_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('OutboxJob', outboxJobSchema);
