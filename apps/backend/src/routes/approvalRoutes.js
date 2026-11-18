const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/rbac');
const { ROLES } = require('@sankara/constants');

router.use(authenticateToken);

router.get(
  '/pending',
  requireRoles(ROLES.CMO),
  approvalController.getPending
);

router.post(
  '/:id/decision',
  requireRoles(ROLES.CMO),
  approvalController.decision
);

router.get(
  '/history',
  requireRoles(ROLES.CMO, ROLES.PRODUCTION_HEAD),
  approvalController.getHistory
);

module.exports = router;
