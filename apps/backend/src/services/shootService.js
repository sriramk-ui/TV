const ShootRequest = require('../models/ShootRequest');
const ShootOccurrence = require('../models/ShootOccurrence');
const User = require('../models/User');
const { computeOccurrenceIntervals } = require('@sankara/shared');
const { SHOOT_STATUS, ROLES } = require('@sankara/constants');

/**
 * Generates the next sequential series code, e.g. SSTV-2026-0001
 */
async function generateSeriesCode() {
  const currentYear = new Date().getFullYear();
  const prefix = `SSTV-${currentYear}-`;
  const count = await ShootRequest.countDocuments({
    series_code: new RegExp(`^${prefix}`)
  });
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

/**
 * Creates a new shoot request with linked occurrences.
 */
async function createShootRequest({
  title,
  clientGuest = '',
  category = 'studio',
  dates = [], // Array of 'YYYY-MM-DD' or single shootDate
  shootDate,
  reportingTime = '07:00',
  rollingTime = '08:30',
  endTime = '16:00',
  isOvernight = false,
  venue,
  venueMapLink = '',
  equipmentRequirements = '',
  crewCountPreferred = 4,
  notes = '',
  urgency = 'normal',
  epUser
}) {
  const seriesCode = await generateSeriesCode();

  // Determine occurrences list
  const occurrenceDates = dates && dates.length > 0 ? dates : [shootDate];
  if (!occurrenceDates[0]) {
    throw new Error('At least one shoot date is required.');
  }

  const shoot = await ShootRequest.create({
    series_code: seriesCode,
    title,
    client_guest: clientGuest,
    category,
    ep_id: epUser._id,
    ep_name: epUser.name,
    status: SHOOT_STATUS.REQUESTED,
    equipment_requirements: equipmentRequirements,
    crew_count_preferred: crewCountPreferred,
    notes,
    urgency
  });

  const occurrences = [];
  for (const sDate of occurrenceDates) {
    const { startAtUtc, endAtUtc } = computeOccurrenceIntervals(
      sDate,
      reportingTime,
      endTime,
      isOvernight
    );

    const occ = await ShootOccurrence.create({
      shoot_id: shoot._id,
      series_code: seriesCode,
      shoot_date: sDate,
      reporting_time: reportingTime,
      rolling_time: rollingTime,
      end_time: endTime,
      is_overnight: isOvernight,
      start_at_utc: startAtUtc,
      end_at_utc: endAtUtc,
      venue,
      venue_map_link: venueMapLink,
      status: SHOOT_STATUS.REQUESTED,
      assignments: []
    });
    occurrences.push(occ);
  }

  return { shoot, occurrences };
}

/**
 * Updates occurrence crew assignments and equipment.
 */
async function assignCrewToOccurrence(occurrenceId, assignments = []) {
  const occ = await ShootOccurrence.findById(occurrenceId);
  if (!occ) throw new Error('Occurrence not found.');

  // Populate user names for assignments
  const processedAssignments = [];
  for (const a of assignments) {
    const user = await User.findById(a.user_id);
    if (user) {
      processedAssignments.push({
        user_id: user._id,
        user_name: user.name,
        role_title: a.role_title || user.designation || 'Crew',
        reporting_override: a.reporting_override || '',
        response_state: 'pending'
      });
    }
  }

  occ.assignments = processedAssignments;
  await occ.save();
  return occ;
}

/**
 * Lists shoots filtered by user role and query.
 */
async function listShoots(user, filterStatus = 'all', searchQuery = '') {
  const query = {};

  if (filterStatus && filterStatus !== 'all') {
    query.status = filterStatus;
  }

  // Role filtering
  if (user.role === ROLES.EP) {
    query.ep_id = user._id; // EP sees only own requests
  }

  const shoots = await ShootRequest.find(query)
    .populate('paf_id', 'status estimated_total_paise')
    .sort({ created_at: -1 });

  // Attach occurrences
  const results = [];
  for (const s of shoots) {
    const occs = await ShootOccurrence.find({ shoot_id: s._id }).sort({ shoot_date: 1 });

    // If crew role, check if user is assigned to at least one occurrence
    if (user.role === ROLES.CREW) {
      const isAssigned = occs.some((occ) =>
        occ.assignments.some((a) => String(a.user_id) === String(user._id))
      );
      if (!isAssigned) continue;
    }

    const shootObj = s.toObject();

    // STRICT INVARIANT: Redact PAF financial fields for EP and Crew
    if (user.role === ROLES.EP || user.role === ROLES.CREW) {
      delete shootObj.paf_id;
    }

    shootObj.occurrences = occs;
    results.push(shootObj);
  }

  if (searchQuery.trim()) {
    const term = searchQuery.toLowerCase();
    return results.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.series_code.toLowerCase().includes(term) ||
        s.ep_name.toLowerCase().includes(term) ||
        s.occurrences.some((o) => o.venue.toLowerCase().includes(term))
    );
  }

  return results;
}

module.exports = {
  generateSeriesCode,
  createShootRequest,
  assignCrewToOccurrence,
  listShoots
};
