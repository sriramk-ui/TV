const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/rbac');
const { ROLES } = require('@sankara/constants');

router.use(authenticateToken);

router.get(
  '/settings',
  requireRoles(ROLES.CMO),
  adminController.getSettings
);

router.put(
  '/settings',
  requireRoles(ROLES.CMO),
  adminController.updateSettings
);

router.get(
  '/audit-logs',
  requireRoles(ROLES.CMO),
  adminController.getAuditLogs
);

router.get(
  '/outbox-jobs',
  requireRoles(ROLES.CMO, ROLES.PRODUCTION_HEAD),
  adminController.getOutboxJobs
);

router.post(
  '/outbox-jobs/:id/retry',
  requireRoles(ROLES.CMO, ROLES.PRODUCTION_HEAD),
  adminController.retryOutboxJob
);

router.get(
  '/health',
  requireRoles(ROLES.CMO),
  adminController.getSystemHealth
);

module.exports = router;
