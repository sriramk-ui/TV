const ShootOccurrence = require('../models/ShootOccurrence');
const { logActivity } = require('../services/auditService');

async function getMyAssignments(req, res, next) {
  try {
    const occurrences = await ShootOccurrence.find({
      'assignments.user_id': req.user._id,
      status: { $in: ['approved', 'pending_approval'] }
    })
      .populate('shoot_id', 'title client_guest category')
      .sort({ shoot_date: 1 });

    const assignments = [];
    for (const occ of occurrences) {
      const myAssign = occ.assignments.find(
        (a) => String(a.user_id) === String(req.user._id)
      );

      if (myAssign) {
        assignments.push({
          occurrence_id: occ._id,
          shoot_id: occ.shoot_id?._id,
          title: occ.shoot_id?.title || 'Production Shoot',
          shoot_date: occ.shoot_date,
          reporting_time: myAssign.reporting_override || occ.reporting_time,
          rolling_time: occ.rolling_time,
          end_time: occ.end_time,
          venue: occ.venue,
          venue_map_link: occ.venue_map_link,
          role_title: myAssign.role_title,
          response_state: myAssign.response_state,
          acknowledged_at: myAssign.acknowledged_at,
          conflict_notes: myAssign.conflict_notes,
          status: occ.status
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (err) {
    next(err);
  }
}

async function acknowledge(req, res, next) {
  try {
    const { occurrenceId } = req.params;
    const { status: ackStatus, conflict_notes } = req.body; // 'acknowledged' or 'conflict_reported'

    const occ = await ShootOccurrence.findById(occurrenceId);
    if (!occ) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Occurrence not found.' }
      });
    }

    const assignment = occ.assignments.find(
      (a) => String(a.user_id) === String(req.user._id)
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not assigned to this shoot.' }
      });
    }

    assignment.response_state = ackStatus === 'conflict_reported' ? 'conflict_reported' : 'acknowledged';
    assignment.acknowledged_at = new Date();
    if (conflict_notes) assignment.conflict_notes = conflict_notes;

    await occ.save();

    await logActivity({
      actor: req.user,
      action: 'CREW_ACKNOWLEDGEMENT',
      entityType: 'ShootOccurrence',
      entityId: occ._id,
      details: { status: assignment.response_state, notes: conflict_notes },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: assignment.response_state === 'acknowledged'
        ? 'Assignment confirmed successfully.'
        : 'Conflict report logged. Production Head has been notified.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyAssignments,
  acknowledge
};
