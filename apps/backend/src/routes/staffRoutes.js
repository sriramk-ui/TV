const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/rbac');
const { ROLES } = require('@sankara/constants');

router.use(authenticateToken);

router.get(
  '/',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO),
  staffController.list
);

router.post(
  '/',
  requireRoles(ROLES.CMO),
  staffController.create
);

router.put(
  '/:id',
  requireRoles(ROLES.CMO),
  staffController.update
);

router.post(
  '/import-csv',
  requireRoles(ROLES.CMO),
  staffController.importCSV
);

module.exports = router;
