const ActivityLog = require('../models/ActivityLog');

async function logActivity({
  actor = null,
  action,
  entityType,
  entityId = null,
  details = {},
  ipAddress = ''
}) {
  try {
    await ActivityLog.create({
      actor_id: actor?._id || actor?.id || null,
      actor_name: actor?.name || 'System',
      actor_role: actor?.role || 'system',
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      details,
      ip_address: ipAddress
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = {
  logActivity
};
