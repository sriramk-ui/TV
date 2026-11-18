import { DEFAULT_BUFFER_MINUTES } from '@sankara/constants';

export const IST_TIMEZONE = 'Asia/Kolkata';

export function toPaise(rupees) {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100);
}

export function toRupees(paise) {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return Math.round(paise) / 100;
}

export function calculateLineAmountPaise(quantity, rateRupees) {
  const qty = Number(quantity) || 0;
  const rateP = toPaise(rateRupees);
  return Math.round(qty * rateP);
}

export function calculatePAFGrandTotalPaise(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, item) => {
    if (typeof item.amount_paise === 'number') {
      return acc + Math.round(item.amount_paise);
    }
    const qty = Number(item.quantity) || 0;
    const rateP = item.rate_paise !== undefined ? Math.round(item.rate_paise) : toPaise(item.rate || 0);
    return acc + Math.round(qty * rateP);
  }, 0);
}

export function formatINR(amount, isPaise = true) {
  const rupees = isPaise ? toRupees(amount) : Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
}

export function getTodayIST() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export function formatDateReadable(dateStr) {
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

export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.padStart(2, '0') : '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

export function parseISTToUTC(dateStr, timeStr = '00:00', addDays = 0) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const istMillis = Date.UTC(year, month - 1, day + addDays, hours, minutes);
  const utcMillis = istMillis - (5.5 * 60 * 60 * 1000);
  return new Date(utcMillis);
}

export function computeOccurrenceIntervals(shootDate, reportingTime, endTime, isOvernight = false) {
  const startAtUtc = parseISTToUTC(shootDate, reportingTime, 0);
  const endsNextDay = isOvernight || (endTime <= reportingTime);
  const endAtUtc = parseISTToUTC(shootDate, endTime, endsNextDay ? 1 : 0);

  return {
    startAtUtc,
    endAtUtc,
    isOvernight: endsNextDay
  };
}

export function intervalsOverlapWithBuffer(startA, endA, startB, endB, bufferMinutes = DEFAULT_BUFFER_MINUTES) {
  const bufferMs = bufferMinutes * 60 * 1000;
  const aStart = new Date(startA).getTime() - bufferMs;
  const aEnd = new Date(endA).getTime() + bufferMs;
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd && aEnd > bStart;
}

export function normalizeE164(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    return digits.length >= 10 && digits.length <= 15 ? cleaned : null;
  }
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  return null;
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}
