const mongoose = require('mongoose');

const approvalRecordSchema = new mongoose.Schema(
  {
    shoot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShootRequest',
      required: true,
      index: true
    },
    series_code: {
      type: String,
      required: true,
      index: true
    },
    revision: {
      type: Number,
      default: 1
    },
    actor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    decision: {
      type: String,
      enum: ['pending', 'approved', 'changes_requested'],
      default: 'pending',
      index: true
    },
    reason: {
      type: String,
      default: ''
    },
    approved_cost_paise: {
      type: Number,
      default: 0
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    submitted_at: {
      type: Date,
      default: Date.now
    },
    decided_at: {
      type: Date,
      default: null
    },
    reminders_sent_count: {
      type: Number,
      default: 0
    },
    last_reminder_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('ApprovalRecord', approvalRecordSchema);
