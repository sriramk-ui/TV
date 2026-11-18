const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { logActivity } = require('../services/auditService');

function generateTokens(user) {
  const payload = {
    sub: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required.' }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DEACTIVATED', message: 'This account has been deactivated.' }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const tokens = generateTokens(user);

    await logActivity({
      actor: user,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens
      },
      message: 'Login successful'
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current and new password required.' }
      });
    }

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Current password does not match.' }
      });
    }

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    req.user.password_hash = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    await logActivity({
      actor: req.user,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: req.user._id,
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

module.exports = {
  login,
  getMe,
  changePassword,
  logout
};
