const express = require('express');
const router = express.Router();
const crewController = require('../controllers/crewController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/my-assignments', crewController.getMyAssignments);
router.post('/assignments/:occurrenceId/ack', crewController.acknowledge);

module.exports = router;
