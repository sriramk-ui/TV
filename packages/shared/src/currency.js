/**
 * Currency and decimal-safe financial calculation utilities.
 * Sri Sankara TV Production Management System.
 * All monetary amounts are stored in integer paise (1 INR = 100 paise) to avoid binary float errors.
 */

/**
 * Converts a rupee number or string to integer paise.
 * @param {number|string} rupees 
 * @returns {number} Integer paise
 */
function toPaise(rupees) {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100);
}

/**
 * Converts integer paise to float rupees.
 * @param {number} paise 
 * @returns {number} Rupees with 2 decimal places
 */
function toRupees(paise) {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return Math.round(paise) / 100;
}

/**
 * Computes line item amount in paise given quantity and unit rate.
 * @param {number} quantity 
 * @param {number|string} rateRupees 
 * @returns {number} Amount in paise
 */
function calculateLineAmountPaise(quantity, rateRupees) {
  const qty = Number(quantity) || 0;
  const rateP = toPaise(rateRupees);
  return Math.round(qty * rateP);
}

/**
 * Sums an array of line items into total paise.
 * @param {Array<{ amount_paise?: number, quantity?: number, rate_paise?: number, rate?: number }>} items 
 * @returns {number} Total in paise
 */
function calculatePAFGrandTotalPaise(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, item) => {
    if (typeof item.amount_paise === 'number') {
      return acc + Math.round(item.amount_paise);
    }
    const qty = Number(item.quantity) || 0;
    const rateP = item.rate_paise !== undefined ? Math.round(item.rate_paise) : toPaise(item.rate || 0);
    return acc + Math.round(qty * rateP);
  }, 0);
}

/**
 * Formats integer paise or rupee float into standard Indian Rupee string: ₹ 7,150.00
 * @param {number} paise 
 * @param {boolean} isPaise Whether the input is in paise (default true)
 * @returns {string} Formatted INR string
 */
function formatINR(amount, isPaise = true) {
  const rupees = isPaise ? toRupees(amount) : Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
}

module.exports = {
  toPaise,
  toRupees,
  calculateLineAmountPaise,
  calculatePAFGrandTotalPaise,
  formatINR
};
