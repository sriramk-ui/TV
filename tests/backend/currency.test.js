const test = require('node:test');
const assert = require('node:assert/strict');
const {
  toPaise,
  toRupees,
  calculateLineAmountPaise,
  calculatePAFGrandTotalPaise,
  formatINR
} = require('@sankara/shared');

test('Currency & Paise Arithmetic: Basic conversion and floating-point protection', () => {
  assert.equal(toPaise(100), 10000);
  assert.equal(toPaise(10.50), 1050);
  assert.equal(toPaise('7150'), 715000);
  assert.equal(toRupees(715000), 7150);

  // Line amount calculation
  const linePaise = calculateLineAmountPaise(3, 250);
  assert.equal(linePaise, 75000);
  assert.equal(toRupees(linePaise), 750);
});

test('T06: PAF line items 2x300 and 1x100 evaluates to exactly ₹700 (70000 paise)', () => {
  const items = [
    { quantity: 2, rate: 300 },
    { quantity: 1, rate: 100 }
  ];
  const grandTotalPaise = calculatePAFGrandTotalPaise(items);
  assert.equal(grandTotalPaise, 70000);
  assert.equal(toRupees(grandTotalPaise), 700);
  assert.equal(formatINR(grandTotalPaise), '₹700.00');
});

test('Sample PAF Historical Test Case: Fuel 4500 + Food/Tea 2400 + Water 250 + Toll 1000 = ₹8,150', () => {
  const items = [
    { quantity: 1, rate: 4500 },
    { quantity: 1, rate: 2400 },
    { quantity: 1, rate: 250 },
    { quantity: 1, rate: 1000 }
  ];
  const grandTotalPaise = calculatePAFGrandTotalPaise(items);
  assert.equal(grandTotalPaise, 815000);
  assert.equal(toRupees(grandTotalPaise), 8150);
});
