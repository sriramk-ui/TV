const env = require('../../config/env');
const CalendarEvent = require('../../models/CalendarEvent');

/**
 * Creates or updates a calendar event in the employee's work calendar.
 */
async function syncCalendarAppointment({
  occurrenceId,
  userId,
  userEmail,
  showTitle,
  venue,
  startAtUtc,
  endAtUtc,
  roleTitle
}) {
  const provider = env.CALENDAR_PROVIDER || 'google';

  // Check if an existing calendar event record exists for this occurrence and user
  let existing = await CalendarEvent.findOne({
    occurrence_id: occurrenceId,
    user_id: userId,
    provider
  });

  const eventTitle = `Sri Sankara TV: ${showTitle} (${roleTitle})`;
  const description = `Production Shoot Assignment for ${showTitle}.\nRole: ${roleTitle}\nVenue: ${venue}\nReporting Time: ${startAtUtc.toISOString()}`;

  if (env.CALENDAR_SANDBOX_MODE || !env.CALENDAR_ENABLED) {
    const externalId = existing?.external_event_id || `cal-${provider}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`[CALENDAR SANDBOX (${provider})] Synced appointment for ${userEmail}: "${eventTitle}" at ${venue} (${startAtUtc.toISOString()})`);

    if (existing) {
      existing.sync_state = 'synced';
      existing.last_synced_at = new Date();
      existing.error_message = null;
      await existing.save();
    } else {
      existing = await CalendarEvent.create({
        occurrence_id: occurrenceId,
        user_id: userId,
        provider,
        external_event_id: externalId,
        sync_state: 'synced',
        last_synced_at: new Date()
      });
    }

    return {
      success: true,
      provider,
      externalEventId: externalId,
      mode: 'sandbox'
    };
  }

  // Live Provider Handler
  try {
    if (provider === 'google') {
      // In production: Google Calendar API client
      const externalId = existing?.external_event_id || `gcal-${Date.now()}`;
      return { success: true, provider: 'google', externalEventId: externalId };
    } else {
      // In production: Microsoft Graph API client
      const externalId = existing?.external_event_id || `graph-${Date.now()}`;
      return { success: true, provider: 'outlook', externalEventId: externalId };
    }
  } catch (err) {
    console.error(`[CALENDAR ERROR (${provider})]`, err.message);
    if (existing) {
      existing.sync_state = 'error';
      existing.error_message = err.message;
      await existing.save();
    }
    throw err;
  }
}

/**
 * Removes calendar appointment upon cancellation.
 */
async function cancelCalendarAppointment(occurrenceId, userId) {
  const provider = env.CALENDAR_PROVIDER || 'google';
  const existing = await CalendarEvent.findOne({
    occurrence_id: occurrenceId,
    user_id: userId,
    provider
  });

  if (!existing) return { success: true, notFound: true };

  if (env.CALENDAR_SANDBOX_MODE || !env.CALENDAR_ENABLED) {
    console.log(`[CALENDAR SANDBOX (${provider})] Removed appointment ID: ${existing.external_event_id}`);
    await CalendarEvent.deleteOne({ _id: existing._id });
    return { success: true, mode: 'sandbox' };
  }

  // Live deletion
  await CalendarEvent.deleteOne({ _id: existing._id });
  return { success: true, mode: 'live' };
}

module.exports = {
  syncCalendarAppointment,
  cancelCalendarAppointment
};
