const mongoose = require('mongoose');
const { SHOOT_STATUS, SHOOT_CATEGORIES } = require('@sankara/constants');

const shootRequestSchema = new mongoose.Schema(
  {
    series_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Show / Shoot Title is required'],
      trim: true
    },
    client_guest: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      enum: Object.values(SHOOT_CATEGORIES),
      default: SHOOT_CATEGORIES.STUDIO
    },
    ep_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ep_name: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(SHOOT_STATUS),
      default: SHOOT_STATUS.REQUESTED,
      index: true
    },
    equipment_requirements: {
      type: String,
      default: ''
    },
    crew_count_preferred: {
      type: Number,
      default: 4
    },
    notes: {
      type: String,
      default: ''
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'priority'],
      default: 'normal'
    },
    paf_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PAF',
      default: null
    },
    revision: {
      type: Number,
      default: 1
    },
    last_submitted_at: {
      type: Date,
      default: null
    },
    approved_at: {
      type: Date,
      default: null
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancellation_reason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('ShootRequest', shootRequestSchema);
