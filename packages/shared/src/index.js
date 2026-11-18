/**
 * @sankara/shared
 * Pure shared utilities for currency calculations, IST dates, conflict detection, and validation.
 */

const currency = require('./currency');
const datetime = require('./datetime');
const conflict = require('./conflict');
const validation = require('./validation');

module.exports = {
  ...currency,
  ...datetime,
  ...conflict,
  ...validation
};
