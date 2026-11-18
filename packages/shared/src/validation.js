/**
 * Validation utilities for phone numbers, emails, and CSV bulk staff imports.
 * Sri Sankara TV Production Management System.
 */

const crypto = require('crypto');

/**
 * Validates and normalizes phone number to international E.164 format.
 * Defaults to Indian country code +91 if 10-digit number is provided.
 * @param {string} phone 
 * @returns {string|null} Normalized E.164 or null if invalid
 */
function normalizeE164(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[^\d+]/g, '');

  // If already starts with +, verify standard length (10 to 15 digits)
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    return digits.length >= 10 && digits.length <= 15 ? cleaned : null;
  }

  // 10-digit Indian mobile
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // 12-digit starting with 91
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Validates email address format.
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Generates an 8-character random temporary password.
 */
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

/**
 * Parses and validates CSV string for bulk staff directory import.
 * Expected columns: name, email, role, team, phone_e164, voice_language, voice_opt_in
 * 
 * @param {string} csvText 
 * @param {Array<string>} validRoles 
 * @returns {{ validRows: Array<Object>, errors: Array<Object> }}
 */
function parseStaffCSV(csvText, validRoles = []) {
  if (!csvText || typeof csvText !== 'string') {
    return { validRows: [], errors: [{ line: 0, error: 'Empty CSV input' }] };
  }

  const lines = csvText.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { validRows: [], errors: [{ line: 1, error: 'CSV must contain a header and at least one data row' }] };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['name', 'email', 'role'];
  for (const req of requiredHeaders) {
    if (!headers.includes(req)) {
      return { validRows: [], errors: [{ line: 1, error: `Missing required header: ${req}` }] };
    }
  }

  const validRows = [];
  const errors = [];
  const seenEmails = new Set();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = rawLine.split(',').map(c => c.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] !== undefined ? cols[idx] : '';
    });

    const lineNum = i + 1;

    if (!row.name) {
      errors.push({ line: lineNum, error: 'Name is required' });
      continue;
    }

    if (!isValidEmail(row.email)) {
      errors.push({ line: lineNum, error: `Invalid email address: ${row.email}` });
      continue;
    }

    const emailLower = row.email.toLowerCase();
    if (seenEmails.has(emailLower)) {
      errors.push({ line: lineNum, error: `Duplicate email within CSV: ${row.email}` });
      continue;
    }
    seenEmails.add(emailLower);

    if (validRoles.length > 0 && !validRoles.includes(row.role.toLowerCase())) {
      errors.push({ line: lineNum, error: `Invalid role "${row.role}". Allowed: ${validRoles.join(', ')}` });
      continue;
    }

    const phoneNormalized = row.phone_e164 ? normalizeE164(row.phone_e164) : '';
    const voiceOptIn = ['yes', 'true', '1', 'y'].includes(String(row.voice_opt_in).toLowerCase());
    const voiceLanguage = ['ta', 'en'].includes(String(row.voice_language).toLowerCase()) ? row.voice_language.toLowerCase() : 'ta';

    validRows.push({
      name: row.name,
      email: emailLower,
      role: row.role.toLowerCase(),
      team: row.team || 'General',
      phone_e164: phoneNormalized || '',
      voice_language: voiceLanguage,
      voice_opt_in: voiceOptIn
    });
  }

  return { validRows, errors };
}

module.exports = {
  normalizeE164,
  isValidEmail,
  generateTemporaryPassword,
  parseStaffCSV
};
