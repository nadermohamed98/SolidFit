
/**
 * Date Utility Functions
 */

/**
 * Get date in YYYY-MM-DD format
 * @param {Date|string} [date=new Date()]
 * @returns {string}
 */
export function toDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get start of day (midnight) for a date
 * @param {Date|string} [date=new Date()]
 * @returns {Date}
 */
export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59.999) for a date
 * @param {Date|string} [date=new Date()]
 * @returns {Date}
 */
export function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get timestamp in ISO format
 * @param {Date|string} [date=new Date()]
 * @returns {string}
 */
export function toISOString(date = new Date()) {
  return new Date(date).toISOString();
}

/**
 * Check if two dates are the same day
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  return toDateString(date1) === toDateString(date2);
}

/**
 * Add days to a date
 * @param {Date|string} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

