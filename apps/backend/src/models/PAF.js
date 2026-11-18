const mongoose = require('mongoose');
const { PAF_STATUS, PAYMENT_MODES } = require('@sankara/constants');

const pafLineItemSchema = new mongoose.Schema(
  {
    particulars: {
      type: String,
      required: [true, 'Particulars / Expense Description is required'],
      trim: true
    },
    unit: {
      type: String,
      default: 'Days'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    rate_paise: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    amount_paise: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    payment_mode: {
      type: String,
      enum: Object.values(PAYMENT_MODES),
      default: PAYMENT_MODES.CASH
    }
  },
  { _id: true }
);

const pafSchema = new mongoose.Schema(
  {
    shoot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShootRequest',
      required: true,
      unique: true,
      index: true
    },
    series_code: {
      type: String,
      required: true,
      index: true
    },
    show_name: {
      type: String,
      required: true,
      trim: true
    },
    shoot_start: {
      type: String,
      required: true
    },
    shoot_end: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    episodes: {
      type: Number,
      default: 1
    },
    equipment_type: {
      type: String,
      default: 'In-house'
    },
    notes: {
      type: String,
      default: ''
    },
    items: [pafLineItemSchema],
    estimated_total_paise: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(PAF_STATUS),
      default: PAF_STATUS.DRAFT,
      index: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approved_at: {
      type: Date,
      default: null
    },
    snapshot_json: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('PAF', pafSchema);
