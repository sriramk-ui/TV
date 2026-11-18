const ShootRequest = require('../models/ShootRequest');
const ShootOccurrence = require('../models/ShootOccurrence');
const { createShootRequest, assignCrewToOccurrence, listShoots } = require('../services/shootService');
const { validateCrewConflicts } = require('../services/conflictService');
const { submitCombinedPackage } = require('../services/approvalService');
const { logActivity } = require('../services/auditService');
const { cancelCalendarAppointment } = require('../integrations/calendar/calendarService');
const { SHOOT_STATUS, ROLES } = require('@sankara/constants');

async function create(req, res, next) {
  try {
    const {
      title,
      client_guest,
      category,
      dates,
      shoot_date,
      reporting_time,
      rolling_time,
      end_time,
      is_overnight,
      venue,
      venue_map_link,
      equipment_requirements,
      crew_count_preferred,
      notes,
      urgency
    } = req.body;

    if (!title || !venue || (!dates?.length && !shoot_date)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Program title, venue, and shoot date are required.' }
      });
    }

    const { shoot, occurrences } = await createShootRequest({
      title,
      clientGuest: client_guest,
      category,
      dates,
      shootDate: shoot_date,
      reportingTime: reporting_time,
      rollingTime: rolling_time,
      endTime: end_time,
      isOvernight: is_overnight,
      venue,
      venueMapLink: venue_map_link,
      equipmentRequirements: equipment_requirements,
      crewCountPreferred: crew_count_preferred,
      notes,
      urgency,
      epUser: req.user
    });

    await logActivity({
      actor: req.user,
      action: 'SHOOT_REQUEST_CREATED',
      entityType: 'ShootRequest',
      entityId: shoot._id,
      details: { title, series_code: shoot.series_code, count: occurrences.length },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      data: { shoot, occurrences },
      message: `Shoot request ${shoot.series_code} created successfully.`
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status = 'all', q = '' } = req.query;
    const shoots = await listShoots(req.user, status, q);
    return res.status(200).json({
      success: true,
      data: shoots
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const shoot = await ShootRequest.findById(req.params.id).populate('paf_id');
    if (!shoot) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Shoot request not found.' }
      });
    }

    const occurrences = await ShootOccurrence.find({ shoot_id: shoot._id }).sort({ shoot_date: 1 });
    const shootObj = shoot.toObject();

    // Redact PAF if EP or Crew
    if (req.user.role === ROLES.EP || req.user.role === ROLES.CREW) {
      delete shootObj.paf_id;
    }

    shootObj.occurrences = occurrences;
    return res.status(200).json({
      success: true,
      data: shootObj
    });
  } catch (err) {
    next(err);
  }
}

async function assignCrew(req, res, next) {
  try {
    const { occurrenceId } = req.params;
    const { assignments = [] } = req.body;

    const occ = await ShootOccurrence.findById(occurrenceId);
    if (!occ) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Occurrence not found.' }
      });
    }

    // Run conflict detection
    const conflictResult = await validateCrewConflicts({
      occurrenceId: occ._id,
      shootDate: occ.shoot_date,
      startAtUtc: occ.start_at_utc,
      endAtUtc: occ.end_at_utc,
      assignments
    });

    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT_DETECTED',
          message: conflictResult.conflicts[0].message,
          details: conflictResult.conflicts
        }
      });
    }

    const updated = await assignCrewToOccurrence(occurrenceId, assignments);

    await logActivity({
      actor: req.user,
      action: 'CREW_ASSIGNED',
      entityType: 'ShootOccurrence',
      entityId: occ._id,
      details: { count: assignments.length },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Crew assigned successfully with zero scheduling conflicts.'
    });
  } catch (err) {
    next(err);
  }
}

async function submit(req, res, next) {
  try {
    const { id } = req.params;
    const result = await submitCombinedPackage(id, req.user);

    await logActivity({
      actor: req.user,
      action: 'COMBINED_PACKAGE_SUBMITTED',
      entityType: 'ShootRequest',
      entityId: id,
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by production management' } = req.body;

    const shoot = await ShootRequest.findById(id);
    if (!shoot) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Shoot not found.' }
      });
    }

    shoot.status = SHOOT_STATUS.CANCELLED;
    shoot.cancellation_reason = reason;
    await shoot.save();

    await ShootOccurrence.updateMany(
      { shoot_id: shoot._id },
      { $set: { status: SHOOT_STATUS.CANCELLED } }
    );

    // Cancel calendar appointments
    const occurrences = await ShootOccurrence.find({ shoot_id: shoot._id });
    for (const occ of occurrences) {
      for (const a of occ.assignments) {
        await cancelCalendarAppointment(occ._id, a.user_id);
      }
    }

    await logActivity({
      actor: req.user,
      action: 'SHOOT_CANCELLED',
      entityType: 'ShootRequest',
      entityId: shoot._id,
      details: { reason },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Shoot ${shoot.series_code} has been cancelled.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  assignCrew,
  submit,
  cancel
};
