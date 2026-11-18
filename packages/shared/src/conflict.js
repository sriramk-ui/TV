/**
 * Crew and Resource Conflict Detection Engine.
 * Sri Sankara TV Production Management System.
 */

const { DEFAULT_BUFFER_MINUTES } = require('@sankara/constants');

/**
 * Checks whether two time intervals overlap, taking into account an optional buffer in minutes.
 * Effective interval A: [startA - bufferMs, endA + bufferMs]
 * Effective interval B: [startB, endB]
 * Overlap condition: (startA_eff < endB) && (endA_eff > startB)
 * 
 * @param {Date|number} startA 
 * @param {Date|number} endA 
 * @param {Date|number} startB 
 * @param {Date|number} endB 
 * @param {number} bufferMinutes Default buffer in minutes (travel/prep)
 * @returns {boolean} True if intervals collide
 */
function intervalsOverlapWithBuffer(startA, endA, startB, endB, bufferMinutes = DEFAULT_BUFFER_MINUTES) {
  const bufferMs = bufferMinutes * 60 * 1000;
  const aStart = new Date(startA).getTime() - bufferMs;
  const aEnd = new Date(endA).getTime() + bufferMs;
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Detects conflicts for a given staff member against a list of existing assignments.
 * 
 * @param {Object} candidateOccurrence The shoot occurrence to be assigned
 * @param {string} candidateOccurrence.shootDate 'YYYY-MM-DD'
 * @param {Date} candidateOccurrence.startAtUtc
 * @param {Date} candidateOccurrence.endAtUtc
 * @param {string|number} candidateOccurrence.occurrenceId
 * @param {Array<Object>} existingAssignments List of occurrences the staff is already assigned to
 * @param {number} bufferMinutes Travel buffer in minutes
 * @returns {{ hasConflict: boolean, conflicts: Array<Object> }}
 */
function detectStaffConflicts(candidateOccurrence, existingAssignments = [], bufferMinutes = DEFAULT_BUFFER_MINUTES) {
  const conflicts = [];

  for (const existing of existingAssignments) {
    // Skip if it's the exact same occurrence being updated
    if (String(existing.occurrenceId || existing._id) === String(candidateOccurrence.occurrenceId)) {
      continue;
    }

    // Skip cancelled shoots
    if (existing.status === 'cancelled') {
      continue;
    }

    const collision = intervalsOverlapWithBuffer(
      candidateOccurrence.startAtUtc,
      candidateOccurrence.endAtUtc,
      existing.startAtUtc,
      existing.endAtUtc,
      bufferMinutes
    );

    if (collision) {
      conflicts.push({
        occurrenceId: existing.occurrenceId || existing._id,
        shootId: existing.shootId,
        seriesCode: existing.seriesCode,
        title: existing.title || existing.showName,
        assignedRole: existing.roleTitle,
        shootDate: existing.shootDate,
        reportingTime: existing.reportingTime,
        endTime: existing.endTime,
        reason: `Overlaps with ${existing.title || 'existing shoot'} (${existing.shootDate} ${existing.reportingTime} - ${existing.endTime}) including ${bufferMinutes}m buffer.`
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
}

module.exports = {
  intervalsOverlapWithBuffer,
  detectStaffConflicts
};
