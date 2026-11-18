const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    actor_name: {
      type: String,
      default: 'System'
    },
    actor_role: {
      type: String,
      default: 'system'
    },
    action: {
      type: String,
      required: true,
      index: true // e.g. 'SHOOT_CREATED', 'PAF_SAVED', 'PACKAGE_APPROVED', 'SETTINGS_UPDATED'
    },
    entity_type: {
      type: String,
      required: true // 'ShootRequest', 'PAF', 'User', 'Settings', 'OutboxJob'
    },
    entity_id: {
      type: String,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ip_address: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

activityLogSchema.index({ created_at: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
