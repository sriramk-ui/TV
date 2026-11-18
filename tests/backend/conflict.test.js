const test = require('node:test');
const assert = require('node:assert/strict');
const { intervalsOverlapWithBuffer, parseISTToUTC } = require('@sankara/shared');

test('T08: Crew member assigned overlapping shoots is detected as collision', () => {
  // Shoot 1: 09:00 - 13:00 on 2026-11-20
  const start1 = parseISTToUTC('2026-11-20', '09:00');
  const end1 = parseISTToUTC('2026-11-20', '13:00');

  // Shoot 2: 11:00 - 15:00 on 2026-11-20 (Direct overlap)
  const start2 = parseISTToUTC('2026-11-20', '11:00');
  const end2 = parseISTToUTC('2026-11-20', '15:00');

  const collision = intervalsOverlapWithBuffer(start1, end1, start2, end2, 60);
  assert.equal(collision, true, 'Expected overlapping intervals to collide');
});

test('T08: Shoot within buffer window is detected as collision', () => {
  // Shoot 1: 06:00 - 10:00 on 2026-11-20
  const start1 = parseISTToUTC('2026-11-20', '06:00');
  const end1 = parseISTToUTC('2026-11-20', '10:00');

  // Shoot 2: 10:30 - 14:00 on 2026-11-20 (Only 30 min gap, buffer is 60 min)
  const start2 = parseISTToUTC('2026-11-20', '10:30');
  const end2 = parseISTToUTC('2026-11-20', '14:00');

  const collision = intervalsOverlapWithBuffer(start1, end1, start2, end2, 60);
  assert.equal(collision, true, 'Expected 30-min gap with 60-min travel buffer to collide');
});

test('T09: Non-overlapping same-day shoots with sufficient travel buffer are allowed', () => {
  // Shoot 1: 06:00 - 10:00 on 2026-11-20
  const start1 = parseISTToUTC('2026-11-20', '06:00');
  const end1 = parseISTToUTC('2026-11-20', '10:00');

  // Shoot 2: 14:00 - 18:00 on 2026-11-20 (4 hours gap, well exceeds 60m buffer)
  const start2 = parseISTToUTC('2026-11-20', '14:00');
  const end2 = parseISTToUTC('2026-11-20', '18:00');

  const collision = intervalsOverlapWithBuffer(start1, end1, start2, end2, 60);
  assert.equal(collision, false, 'Expected non-overlapping intervals with buffer to NOT collide');
});
