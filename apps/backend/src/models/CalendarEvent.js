const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
  {
    occurrence_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShootOccurrence',
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ['google', 'outlook'],
      required: true
    },
    external_event_id: {
      type: String,
      required: true,
      index: true
    },
    sync_state: {
      type: String,
      enum: ['synced', 'pending_update', 'pending_delete', 'error'],
      default: 'synced'
    },
    last_synced_at: {
      type: Date,
      default: Date.now
    },
    error_message: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

calendarEventSchema.index({ occurrence_id: 1, user_id: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
