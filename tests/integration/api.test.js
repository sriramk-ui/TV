const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../../apps/backend/src/app');
const { connectDB, disconnectDB } = require('../../apps/backend/src/config/db');
const seed = require('../../apps/backend/src/config/seeder');
const User = require('../../apps/backend/src/models/User');

let epToken = '';
let headToken = '';
let cmoToken = '';
let accountsToken = '';
let crewUser = null;

test.before(async () => {
  // Connect and seed test data without disconnecting in-memory instance
  await seed(false);

  // Login as EP
  const epRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'ep1@srisankaratv.com', password: 'Password@123' });
  assert.equal(epRes.status, 200);
  epToken = epRes.body.data.tokens.accessToken;

  // Login as Production Head
  const headRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'productionhead@srisankaratv.com', password: 'Password@123' });
  assert.equal(headRes.status, 200);
  headToken = headRes.body.data.tokens.accessToken;

  // Login as CMO
  const cmoRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'cmo@srisankaratv.com', password: 'Password@123' });
  assert.equal(cmoRes.status, 200);
  cmoToken = cmoRes.body.data.tokens.accessToken;

  // Login as Accounts
  const accRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'accounts@srisankaratv.com', password: 'Password@123' });
  assert.equal(accRes.status, 200);
  accountsToken = accRes.body.data.tokens.accessToken;

  crewUser = await User.findOne({ email: 'karthik.camera@srisankaratv.com' });
});

test.after(async () => {
  await disconnectDB();
});

test('T01: EP creates single-day request without PAF', async () => {
  const res = await request(app)
    .post('/api/v1/shoots')
    .set('Authorization', `Bearer ${epToken}`)
    .send({
      title: 'Navaratri Special Ep 1',
      client_guest: 'Mylapore Temple',
      category: 'temple_ob',
      shoot_date: '2026-11-25',
      reporting_time: '06:30',
      rolling_time: '07:30',
      end_time: '12:00',
      venue: 'Kapaleeshwarar Temple, Mylapore'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.shoot.status, 'requested');
  assert.equal(res.body.data.occurrences.length, 1);
  assert.equal(res.body.data.shoot.paf_id, null); // Zero PAF required for initial request
});

test('T02: EP creates 3-day request generating linked series + 3 occurrences', async () => {
  const res = await request(app)
    .post('/api/v1/shoots')
    .set('Authorization', `Bearer ${epToken}`)
    .send({
      title: 'Margazhi Music Festival',
      client_guest: 'Music Academy',
      category: 'event',
      dates: ['2026-12-15', '2026-12-16', '2026-12-17'],
      reporting_time: '08:00',
      rolling_time: '09:00',
      end_time: '13:00',
      venue: 'The Music Academy, TTK Road, Chennai'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.data.occurrences.length, 3);
  const seriesCode = res.body.data.shoot.series_code;
  assert.ok(seriesCode.startsWith('SSTV-'));
  res.body.data.occurrences.forEach((occ) => {
    assert.equal(occ.series_code, seriesCode);
  });
});

test('T03: EP attempts to call PAF create API -> returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/v1/pafs')
    .set('Authorization', `Bearer ${epToken}`)
    .send({
      shoot_id: '507f1f77bcf86cd799439011',
      show_name: 'Blocked Request',
      items: [{ particulars: 'Unauthorized Cost', rate: 5000, quantity: 1 }]
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.error.message, /prohibited from accessing PAF financial budgets/);
});

test('T04: EP attempts to open direct printable PAF URL -> returns 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/v1/pafs/507f1f77bcf86cd799439011/print')
    .set('Authorization', `Bearer ${epToken}`);

  assert.equal(res.status, 403);
});

test('T05 & T06: Production Head creates PAF with 2x300 and 1x100 -> Total ₹700', async () => {
  // First find existing requested shoot
  const listRes = await request(app)
    .get('/api/v1/shoots')
    .set('Authorization', `Bearer ${headToken}`);
  const shoot = listRes.body.data[0];

  const pafRes = await request(app)
    .post('/api/v1/pafs')
    .set('Authorization', `Bearer ${headToken}`)
    .send({
      shoot_id: shoot._id,
      show_name: shoot.title,
      shoot_start: '2026-11-25',
      shoot_end: '2026-11-25',
      location: 'Chennai',
      items: [
        { particulars: 'Camera Kit', quantity: 2, rate: 300, payment_mode: 'Cash' },
        { particulars: 'Assistant Allowance', quantity: 1, rate: 100, payment_mode: 'UPI' }
      ]
    });

  assert.equal(pafRes.status, 200);
  assert.equal(pafRes.body.data.estimated_total, 700);
  assert.equal(pafRes.body.data.estimated_total_formatted, '₹700.00');
});

test('T07: Production Head submits shoot without crew on one day -> blocked', async () => {
  // Create an empty shoot with no crew
  const emptyShootRes = await request(app)
    .post('/api/v1/shoots')
    .set('Authorization', `Bearer ${epToken}`)
    .send({
      title: 'Crewless Shoot Test',
      shoot_date: '2026-11-30',
      reporting_time: '08:00',
      rolling_time: '09:00',
      end_time: '12:00',
      venue: 'Studio A'
    });
  const shootId = emptyShootRes.body.data.shoot._id;

  // Prepare PAF
  await request(app)
    .post('/api/v1/pafs')
    .set('Authorization', `Bearer ${headToken}`)
    .send({
      shoot_id: shootId,
      show_name: 'Crewless Shoot Test',
      shoot_start: '2026-11-30',
      shoot_end: '2026-11-30',
      location: 'Studio A',
      items: [{ particulars: 'Studio Electricity', quantity: 1, rate: 500 }]
    });

  // Attempt submit without crew
  const submitRes = await request(app)
    .post(`/api/v1/shoots/${shootId}/submit`)
    .set('Authorization', `Bearer ${headToken}`);

  assert.equal(submitRes.status, 500); // Throws unprocessable error
  assert.match(submitRes.body.error.message, /has no crew assigned/);
});

test('T10 & T15: Head submits full package and CMO approves both atomically', async () => {
  // Find a shoot with crew assigned and PAF ready
  const listRes = await request(app)
    .get('/api/v1/shoots')
    .set('Authorization', `Bearer ${headToken}`);
  const shoot = listRes.body.data.find(s => s.series_code === 'SSTV-2026-0001');
  assert.ok(shoot);

  // Submit to CMO
  const subRes = await request(app)
    .post(`/api/v1/shoots/${shoot._id}/submit`)
    .set('Authorization', `Bearer ${headToken}`);
  assert.equal(subRes.status, 200);

  // CMO views pending packages
  const pendingRes = await request(app)
    .get('/api/v1/approvals/pending')
    .set('Authorization', `Bearer ${cmoToken}`);
  assert.equal(pendingRes.status, 200);
  assert.ok(pendingRes.body.data.length > 0);

  // CMO Approves
  const approveRes = await request(app)
    .post(`/api/v1/approvals/${shoot._id}/decision`)
    .set('Authorization', `Bearer ${cmoToken}`)
    .send({ decision: 'approve' });

  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.data.decision, 'approved');
});

test('T18: Accounts receives and views approved PAF', async () => {
  const pafRes = await request(app)
    .get('/api/v1/pafs')
    .set('Authorization', `Bearer ${accountsToken}`);

  assert.equal(pafRes.status, 200);
  assert.ok(pafRes.body.data.length > 0);
  // Accounts sees only approved PAFs
  pafRes.body.data.forEach((paf) => {
    assert.equal(paf.status, 'approved');
  });
});

test('T19: EP views approved schedule without financial amounts', async () => {
  const listRes = await request(app)
    .get('/api/v1/shoots')
    .set('Authorization', `Bearer ${epToken}`);

  assert.equal(listRes.status, 200);
  listRes.body.data.forEach((shoot) => {
    assert.equal(shoot.paf_id, undefined, 'PAF reference must be redacted for EP');
  });
});

test('T31: Deactivated user login is rejected', async () => {
  // Deactivate crew user
  crewUser.active = false;
  await crewUser.save();

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: crewUser.email, password: 'Password@123' });

  assert.equal(res.status, 403);
  assert.equal(res.body.error.code, 'ACCOUNT_DEACTIVATED');

  // Reactivate for test cleanup
  crewUser.active = true;
  await crewUser.save();
});
