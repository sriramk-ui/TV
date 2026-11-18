const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const shootRoutes = require('./shootRoutes');
const pafRoutes = require('./pafRoutes');
const approvalRoutes = require('./approvalRoutes');
const staffRoutes = require('./staffRoutes');
const crewRoutes = require('./crewRoutes');
const adminRoutes = require('./adminRoutes');
const webhookRoutes = require('./webhookRoutes');

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Sri Sankara TV Production API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/shoots', shootRoutes);
router.use('/pafs', pafRoutes);
router.use('/approvals', approvalRoutes);
router.use('/staff', staffRoutes);
router.use('/crew', crewRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);

module.exports = router;
