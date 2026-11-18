const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./db');
const User = require('../models/User');
const ShootRequest = require('../models/ShootRequest');
const ShootOccurrence = require('../models/ShootOccurrence');
const PAF = require('../models/PAF');
const SystemSettings = require('../models/SystemSettings');
const { ROLES, SHOOT_STATUS, PAF_STATUS, PAYMENT_MODES } = require('@sankara/constants');
const { computeOccurrenceIntervals, calculatePAFGrandTotalPaise, calculateLineAmountPaise } = require('@sankara/shared');

async function seed(shouldDisconnect = true) {
  console.log('Seeding Sri Sankara TV Production Database...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    ShootRequest.deleteMany({}),
    ShootOccurrence.deleteMany({}),
    PAF.deleteMany({}),
    SystemSettings.deleteMany({})
  ]);

  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  console.log('Creating System Users...');
  const usersToSeed = [
    {
      name: 'Sundara Raman (CMO)',
      email: 'cmo@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.CMO,
      team: 'Management',
      designation: 'Chief Managing Officer',
      phone_e164: '+919840011001',
      voice_language: 'ta',
      voice_opt_in: true,
      consent_timestamp: new Date(),
      active: true
    },
    {
      name: 'K. Natarajan',
      email: 'productionhead@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.PRODUCTION_HEAD,
      team: 'Production',
      designation: 'Production Head',
      phone_e164: '+919840011002',
      voice_language: 'ta',
      voice_opt_in: true,
      consent_timestamp: new Date(),
      active: true
    },
    {
      name: 'R. Shankaranarayanan (EP 1)',
      email: 'ep1@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.EP,
      team: 'Devotional & Cultural',
      designation: 'Executive Producer',
      phone_e164: '+919840011003',
      voice_language: 'ta',
      voice_opt_in: false,
      active: true
    },
    {
      name: 'Meenakshi Sundaram (EP 2)',
      email: 'ep2@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.EP,
      team: 'Carnatic & Music',
      designation: 'Executive Producer',
      phone_e164: '+919840011004',
      voice_language: 'ta',
      voice_opt_in: false,
      active: true
    },
    {
      name: 'S. Padmanabhan (Finance)',
      email: 'accounts@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.ACCOUNTS,
      team: 'Accounts & Finance',
      designation: 'Accounts Officer',
      phone_e164: '+919840011005',
      voice_language: 'en',
      voice_opt_in: false,
      active: true
    },
    {
      name: 'V. Karthik',
      email: 'karthik.camera@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.CREW,
      team: 'Camera',
      designation: 'Senior Camera Operator',
      phone_e164: '+919840011010',
      voice_language: 'ta',
      voice_opt_in: true,
      consent_timestamp: new Date(),
      active: true
    },
    {
      name: 'P. Balaji',
      email: 'balaji.tech@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.CREW,
      team: 'Audio & Broadcast',
      designation: 'Broadcast Technician',
      phone_e164: '+919840011011',
      voice_language: 'ta',
      voice_opt_in: true,
      consent_timestamp: new Date(),
      active: true
    },
    {
      name: 'M. Rajesh',
      email: 'rajesh.editor@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.CREW,
      team: 'Post-Production',
      designation: 'Video Editor',
      phone_e164: '+919840011012',
      voice_language: 'ta',
      voice_opt_in: true,
      consent_timestamp: new Date(),
      active: true
    },
    {
      name: 'T. Suresh',
      email: 'suresh.driver@srisankaratv.com',
      password_hash: passwordHash,
      role: ROLES.CREW,
      team: 'Transport',
      designation: 'OB Van Driver',
      phone_e164: '+919840011013',
      voice_language: 'ta',
      voice_opt_in: true,
      consent_timestamp: new Date(),
      active: true
    }
  ];

  const seededUsers = await User.insertMany(usersToSeed);
  const epUser = seededUsers.find((u) => u.email === 'ep1@srisankaratv.com');
  const headUser = seededUsers.find((u) => u.email === 'productionhead@srisankaratv.com');
  const camUser = seededUsers.find((u) => u.email === 'karthik.camera@srisankaratv.com');
  const techUser = seededUsers.find((u) => u.email === 'balaji.tech@srisankaratv.com');
  const driverUser = seededUsers.find((u) => u.email === 'suresh.driver@srisankaratv.com');

  console.log('Creating Global System Settings...');
  await SystemSettings.create({
    key: 'global_settings',
    finance_emails: ['accounts@srisankaratv.com'],
    travel_buffer_minutes: 60,
    brevo_enabled: false,
    msg91_enabled: false,
    calendar_provider: 'google',
    calendar_enabled: false
  });

  console.log('Creating Sample Production: Purattasi Saturdays Special...');
  const shoot = await ShootRequest.create({
    series_code: 'SSTV-2026-0001',
    title: 'Purattasi Saturdays Special — Tirumala OB Broadcast',
    client_guest: 'Tirumala Tirupati Devasthanams (TTD)',
    category: 'temple_ob',
    ep_id: epUser._id,
    ep_name: epUser.name,
    status: SHOOT_STATUS.REQUESTED,
    equipment_requirements: 'Sony FX6 3-Cam Kit, Wireless Lapels, Live OB Switcher',
    crew_count_preferred: 5,
    notes: 'Live outside broadcast coverage of morning darshan and special seva rituals.',
    urgency: 'priority'
  });

  const shootDate1 = '2026-11-21';
  const { startAtUtc, endAtUtc } = computeOccurrenceIntervals(shootDate1, '06:00', '13:00', false);

  const occurrence = await ShootOccurrence.create({
    shoot_id: shoot._id,
    series_code: shoot.series_code,
    shoot_date: shootDate1,
    reporting_time: '06:00',
    rolling_time: '07:30',
    end_time: '13:00',
    is_overnight: false,
    start_at_utc: startAtUtc,
    end_at_utc: endAtUtc,
    venue: 'Sri Venkateswara Swamy Temple, T. Nagar, Chennai',
    venue_map_link: 'https://maps.google.com/?q=Tirumala+Temple+Chennai',
    status: SHOOT_STATUS.REQUESTED,
    assignments: [
      {
        user_id: camUser._id,
        user_name: camUser.name,
        role_title: 'Camera 1 (Main Altar)',
        response_state: 'pending'
      },
      {
        user_id: techUser._id,
        user_name: techUser.name,
        role_title: 'Broadcast Audio Engineer',
        response_state: 'pending'
      },
      {
        user_id: driverUser._id,
        user_name: driverUser.name,
        role_title: 'OB Van Driver',
        response_state: 'pending'
      }
    ]
  });

  console.log('Creating Sample PAF Budget (Reference ₹7,150 test case)...');
  // Replicating itemized test expenses:
  // Fuel: ₹4,500
  // Food & Water: ₹2,650
  const pafItems = [
    {
      particulars: 'OB Van Diesel & Generator Fuel',
      unit: 'Litres',
      quantity: 45,
      rate_paise: 10000, // ₹100 per litre
      amount_paise: 450000, // ₹4,500
      payment_mode: PAYMENT_MODES.COMPANY_EXPENSE
    },
    {
      particulars: 'Crew Breakfast & Mid-day Meals (8 persons)',
      unit: 'Persons',
      quantity: 8,
      rate_paise: 25000, // ₹250 per meal
      amount_paise: 200000, // ₹2,000
      payment_mode: PAYMENT_MODES.CASH
    },
    {
      particulars: 'Packaged Mineral Water (10 Bubble Tops)',
      unit: 'Bubble Tops',
      quantity: 10,
      rate_paise: 4000, // ₹40 per top
      amount_paise: 40000, // ₹400
      payment_mode: PAYMENT_MODES.CASH
    },
    {
      particulars: 'Highway Toll Charges',
      unit: 'Trips',
      quantity: 5,
      rate_paise: 5000, // ₹50
      amount_paise: 25000, // ₹250
      payment_mode: PAYMENT_MODES.UPI
    }
  ];

  const totalPaise = calculatePAFGrandTotalPaise(pafItems);

  const paf = await PAF.create({
    shoot_id: shoot._id,
    series_code: shoot.series_code,
    show_name: shoot.title,
    shoot_start: shootDate1,
    shoot_end: shootDate1,
    location: occurrence.venue,
    episodes: 1,
    equipment_type: 'In-house OB Kit',
    notes: 'TTD Purattasi Special Episode 1',
    items: pafItems,
    estimated_total_paise: totalPaise,
    status: PAF_STATUS.DRAFT,
    created_by: headUser._id
  });

  shoot.paf_id = paf._id;
  await shoot.save();

  console.log('✅ Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Test Accounts (Password for all: Password@123):');
  console.log('1. CMO / Admin:        cmo@srisankaratv.com');
  console.log('2. Production Head:    productionhead@srisankaratv.com');
  console.log('3. Executive Producer: ep1@srisankaratv.com');
  console.log('4. Accounts / Finance: accounts@srisankaratv.com');
  console.log('5. Crew Member:        karthik.camera@srisankaratv.com');
  console.log('----------------------------------------------------');

  if (shouldDisconnect) {
    await disconnectDB();
  }
}

if (require.main === module) {
  seed(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seed;
