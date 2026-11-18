const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { parseStaffCSV, generateTemporaryPassword, normalizeE164 } = require('@sankara/shared');
const { ROLES } = require('@sankara/constants');
const { logActivity } = require('../services/auditService');

async function list(req, res, next) {
  try {
    const staff = await User.find().sort({ role: 1, name: 1 });
    return res.status(200).json({
      success: true,
      data: staff
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      name,
      email,
      role = 'crew',
      team = 'Production',
      designation = '',
      phone_e164,
      voice_language = 'ta',
      voice_opt_in = false
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and email are required.' }
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'A user with this email address already exists.' }
      });
    }

    const tempPassword = generateTemporaryPassword();
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      team,
      designation,
      phone_e164: phone_e164 ? normalizeE164(phone_e164) : '',
      voice_language,
      voice_opt_in: Boolean(voice_opt_in),
      consent_timestamp: voice_opt_in ? new Date() : null,
      active: true
    });

    await logActivity({
      actor: req.user,
      action: 'STAFF_CREATED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        temporaryPassword: tempPassword
      },
      message: `Staff member ${user.name} created.`
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      team,
      designation,
      phone_e164,
      voice_language,
      voice_opt_in,
      active
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Staff member not found.' }
      });
    }

    if (name) user.name = name;
    if (role && Object.values(ROLES).includes(role)) user.role = role;
    if (team) user.team = team;
    if (designation !== undefined) user.designation = designation;
    if (phone_e164 !== undefined) user.phone_e164 = phone_e164 ? normalizeE164(phone_e164) : '';
    if (voice_language) user.voice_language = voice_language;
    if (voice_opt_in !== undefined) {
      user.voice_opt_in = Boolean(voice_opt_in);
      if (user.voice_opt_in) user.consent_timestamp = new Date();
    }
    if (active !== undefined) user.active = Boolean(active);

    await user.save();

    await logActivity({
      actor: req.user,
      action: 'STAFF_UPDATED',
      entityType: 'User',
      entityId: user._id,
      details: { active: user.active },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: user.toJSON(),
      message: 'Staff member updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function importCSV(req, res, next) {
  try {
    const { csv } = req.body;
    if (!csv) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'CSV text content is required.' }
      });
    }

    const { validRows, errors } = parseStaffCSV(csv, Object.values(ROLES));
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'CSV_VALIDATION_ERROR',
          message: `CSV parsing failed on line ${errors[0].line}: ${errors[0].error}`,
          details: errors
        }
      });
    }

    let createdCount = 0;
    let updatedCount = 0;
    const temporaryCredentials = [];

    for (const r of validRows) {
      let existing = await User.findOne({ email: r.email });
      if (existing) {
        existing.name = r.name;
        existing.role = r.role;
        existing.team = r.team;
        existing.phone_e164 = r.phone_e164;
        existing.voice_language = r.voice_language;
        existing.voice_opt_in = r.voice_opt_in;
        existing.active = true;
        await existing.save();
        updatedCount++;
      } else {
        const tempPassword = generateTemporaryPassword();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(tempPassword, salt);

        await User.create({
          name: r.name,
          email: r.email,
          password_hash,
          role: r.role,
          team: r.team,
          phone_e164: r.phone_e164,
          voice_language: r.voice_language,
          voice_opt_in: r.voice_opt_in,
          consent_timestamp: r.voice_opt_in ? new Date() : null,
          active: true
        });
        createdCount++;
        temporaryCredentials.push({
          name: r.name,
          email: r.email,
          temporaryPassword: tempPassword
        });
      }
    }

    await logActivity({
      actor: req.user,
      action: 'STAFF_BULK_IMPORTED',
      entityType: 'User',
      details: { created: createdCount, updated: updatedCount },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: {
        created: createdCount,
        updated: updatedCount,
        temporaryCredentials
      },
      message: `Staff import complete: ${createdCount} created, ${updatedCount} updated.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create,
  update,
  importCSV
};
