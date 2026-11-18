const express = require('express');
const router = express.Router();
const pafController = require('../controllers/pafController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRoles, forbidEPAndCrewFinancialAccess } = require('../middlewares/rbac');
const { ROLES } = require('@sankara/constants');

router.use(authenticateToken);
// STRICT INVARIANT: Deny EP and Crew from any access to PAF endpoints
router.use(forbidEPAndCrewFinancialAccess);

router.post(
  '/',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO),
  pafController.save
);

router.get(
  '/',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO, ROLES.ACCOUNTS),
  pafController.list
);

router.get(
  '/:id',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO, ROLES.ACCOUNTS),
  pafController.getById
);

router.get(
  '/:id/print',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO, ROLES.ACCOUNTS),
  pafController.getPrintView
);

module.exports = router;
