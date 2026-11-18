const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeE164, isValidEmail, parseStaffCSV } = require('@sankara/shared');
const { ROLES } = require('@sankara/constants');

test('Phone normalization: Converts 10-digit Indian numbers to E.164', () => {
  assert.equal(normalizeE164('9840011010'), '+919840011010');
  assert.equal(normalizeE164('+919840011010'), '+919840011010');
  assert.equal(normalizeE164('919840011010'), '+919840011010');
  assert.equal(normalizeE164('1234'), null); // Invalid length
});

test('Email validation: Checks proper format', () => {
  assert.equal(isValidEmail('cmo@srisankaratv.com'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail('user@domain'), false);
});

test('T32: Staff CSV validation catches duplicate emails and invalid roles', () => {
  const sampleCSV = `name,email,role,team,phone_e164,voice_language,voice_opt_in
Valid User,valid@srisankaratv.com,crew,Camera,9840011010,ta,yes
Duplicate User,valid@srisankaratv.com,crew,Camera,9840011011,ta,no
Invalid Role User,invalid@srisankaratv.com,superhero,Camera,9840011012,ta,no`;

  const { validRows, errors } = parseStaffCSV(sampleCSV, Object.values(ROLES));

  assert.equal(errors.length, 2, 'Expected 2 validation errors');
  assert.match(errors[0].error, /Duplicate email/);
  assert.match(errors[1].error, /Invalid role/);
  assert.equal(validRows.length, 1);
});
