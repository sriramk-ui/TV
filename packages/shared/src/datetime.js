/**
 * Date and Time utilities for Sri Sankara TV Production Portal.
 * Enforces Asia/Kolkata (IST) time zone representations and UTC ISO storage.
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kolkata.
 */
function getTodayIST() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

/**
 * Formats date into readable string, e.g. "Thu, 18 Nov 2026"
 */
function formatDateReadable(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Formats 24h time ("14:30") into 12h readable time ("02:30 PM")
 */
function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.padStart(2, '0') : '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

/**
 * Parses date + time string in IST into a UTC Date object.
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {string} timeStr 'HH:mm'
 * @param {boolean} addDays Number of days to add (e.g. 1 for overnight past midnight)
 * @returns {Date} UTC Date object
 */
function parseISTToUTC(dateStr, timeStr = '00:00', addDays = 0) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // IST is UTC+5:30. To get UTC, subtract 5 hours 30 mins
  const istMillis = Date.UTC(year, month - 1, day + addDays, hours, minutes);
  const utcMillis = istMillis - (5.5 * 60 * 60 * 1000);
  return new Date(utcMillis);
}

/**
 * Calculates start_at_utc and end_at_utc for a shoot occurrence.
 * @param {string} shootDate 'YYYY-MM-DD'
 * @param {string} reportingTime 'HH:mm'
 * @param {string} endTime 'HH:mm'
 * @param {boolean} isOvernight Whether the shoot ends after midnight
 */
function computeOccurrenceIntervals(shootDate, reportingTime, endTime, isOvernight = false) {
  const startAtUtc = parseISTToUTC(shootDate, reportingTime, 0);

  // If marked overnight or endTime <= reportingTime, end is the next day
  const endsNextDay = isOvernight || (endTime <= reportingTime);
  const endAtUtc = parseISTToUTC(shootDate, endTime, endsNextDay ? 1 : 0);

  return {
    startAtUtc,
    endAtUtc,
    isOvernight: endsNextDay
  };
}

module.exports = {
  IST_TIMEZONE,
  getTodayIST,
  formatDateReadable,
  formatTime12h,
  parseISTToUTC,
  computeOccurrenceIntervals
};
