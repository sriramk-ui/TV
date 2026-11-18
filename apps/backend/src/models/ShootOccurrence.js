const mongoose = require('mongoose');
const { SHOOT_STATUS, ACK_STATES } = require('@sankara/constants');

const assignmentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    user_name: {
      type: String,
      default: ''
    },
    role_title: {
      type: String,
      required: true,
      default: 'Crew Member'
    },
    reporting_override: {
      type: String,
      default: ''
    },
    response_state: {
      type: String,
      enum: Object.values(ACK_STATES),
      default: ACK_STATES.PENDING
    },
    acknowledged_at: {
      type: Date,
      default: null
    },
    conflict_notes: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const shootOccurrenceSchema = new mongoose.Schema(
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
    shoot_date: {
      type: String,
      required: true,
      index: true // 'YYYY-MM-DD'
    },
    reporting_time: {
      type: String,
      required: true // 'HH:mm'
    },
    rolling_time: {
      type: String,
      required: true // 'HH:mm'
    },
    end_time: {
      type: String,
      required: true // 'HH:mm'
    },
    is_overnight: {
      type: Boolean,
      default: false
    },
    start_at_utc: {
      type: Date,
      required: true,
      index: true
    },
    end_at_utc: {
      type: Date,
      required: true,
      index: true
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    venue_map_link: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(SHOOT_STATUS),
      default: SHOOT_STATUS.REQUESTED,
      index: true
    },
    assignments: [assignmentSchema]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('ShootOccurrence', shootOccurrenceSchema);
