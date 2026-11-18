const ShootOccurrence = require('../models/ShootOccurrence');
const SystemSettings = require('../models/SystemSettings');
const { intervalsOverlapWithBuffer } = require('@sankara/shared');
const { SHOOT_STATUS } = require('@sankara/constants');

/**
 * Validates crew assignments for an occurrence against other active shoots.
 * @param {Object} params
 * @param {string} params.occurrenceId
 * @param {string} params.shootDate 'YYYY-MM-DD'
 * @param {Date} params.startAtUtc
 * @param {Date} params.endAtUtc
 * @param {Array<{ user_id: string, role_title: string }>} params.assignments
 * @returns {Promise<{ hasConflict: boolean, conflicts: Array<Object> }>}
 */
async function validateCrewConflicts({
  occurrenceId = null,
  shootDate,
  startAtUtc,
  endAtUtc,
  assignments = []
}) {
  const settings = await SystemSettings.findOne({ key: 'global_settings' });
  const bufferMinutes = settings?.travel_buffer_minutes || 60;

  const userIds = assignments.map((a) => a.user_id).filter(Boolean);
  if (userIds.length === 0) {
    return { hasConflict: false, conflicts: [] };
  }

  // Find other occurrences on the same date with active or pending status
  const query = {
    shoot_date: shootDate,
    status: { $in: [SHOOT_STATUS.REQUESTED, SHOOT_STATUS.PENDING_APPROVAL, SHOOT_STATUS.APPROVED] },
    'assignments.user_id': { $in: userIds }
  };

  if (occurrenceId) {
    query._id = { $ne: occurrenceId };
  }

  const conflictingOccurrences = await ShootOccurrence.find(query).populate('shoot_id', 'title series_code');

  const conflicts = [];

  for (const existingOcc of conflictingOccurrences) {
    const isColliding = intervalsOverlapWithBuffer(
      startAtUtc,
      endAtUtc,
      existingOcc.startAtUtc,
      existingOcc.endAtUtc,
      bufferMinutes
    );

    if (isColliding) {
      for (const existingAssign of existingOcc.assignments) {
        const candidate = assignments.find(
          (a) => String(a.user_id) === String(existingAssign.user_id)
        );

        if (candidate) {
          conflicts.push({
            userId: candidate.user_id,
            userName: existingAssign.user_name || 'Crew Member',
            collidedShootId: existingOcc.shoot_id?._id,
            collidedSeriesCode: existingOcc.shoot_id?.series_code,
            collidedTitle: existingOcc.shoot_id?.title || 'Another Shoot',
            collidedOccurrenceId: existingOcc._id,
            collidedDate: existingOcc.shoot_date,
            collidedReportingTime: existingOcc.reporting_time,
            collidedEndTime: existingOcc.end_time,
            bufferMinutes,
            message: `Conflict: ${existingAssign.user_name || 'Staff member'} is already assigned to "${existingOcc.shoot_id?.title}" on ${existingOcc.shoot_date} (${existingOcc.reporting_time} - ${existingOcc.end_time}) with ${bufferMinutes}m buffer window.`
          });
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
}

module.exports = {
  validateCrewConflicts
};
