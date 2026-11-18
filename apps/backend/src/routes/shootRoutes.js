const express = require('express');
const router = express.Router();
const shootController = require('../controllers/shootController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/rbac');
const { ROLES } = require('@sankara/constants');

router.use(authenticateToken);

router.post(
  '/',
  requireRoles(ROLES.EP, ROLES.PRODUCTION_HEAD, ROLES.CMO),
  shootController.create
);

router.get('/', shootController.list);

router.get('/:id', shootController.getById);

router.put(
  '/occurrences/:occurrenceId/assignments',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO),
  shootController.assignCrew
);

router.post(
  '/:id/submit',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO),
  shootController.submit
);

router.post(
  '/:id/cancel',
  requireRoles(ROLES.PRODUCTION_HEAD, ROLES.CMO),
  shootController.cancel
);

module.exports = router;
