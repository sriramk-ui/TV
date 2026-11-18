const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('@sankara/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'User role is required'],
      index: true
    },
    designation: {
      type: String,
      default: ''
    },
    team: {
      type: String,
      default: 'Production'
    },
    phone_e164: {
      type: String,
      default: ''
    },
    voice_language: {
      type: String,
      enum: ['ta', 'en'],
      default: 'ta'
    },
    voice_opt_in: {
      type: Boolean,
      default: false
    },
    consent_timestamp: {
      type: Date,
      default: null
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Omit password_hash in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
