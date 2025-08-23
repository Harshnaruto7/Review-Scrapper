import fs from 'fs';
import path from 'path';

/**
 * parsing helper function for date
 * @param {string|Date} value
 * @returns {Date|null}

/**
 * adding timestamp to end of the day
 * @param {string|Date} value
 * @returns {Date}
 */
function endOfDay(value) {
  const d = toDate(value);
  if (!d) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Filters reviews by a date range 
 * 
 *
 * @param {Array<{date:string}>} reviews
 * @param {string} startDateStr 
 * @param {string} endDateStr   
 * @returns {Array}
 */
export function filterReviewsByDateRange(reviews, startDateStr, endDateStr) {
  const start = toDate(startDateStr);
  const end = endOfDay(endDateStr);
  if (!start || !end) {
    console.warn('Invalid start or end date in filterReviewsByDateRange');
    return Array.isArray(reviews) ? reviews.slice() : [];
  }
  return (Array.isArray(reviews) ? reviews : []).filter(({ date }) => {
    const rd = toDate(date);
    return !!rd && rd >= start && rd <= end;
  });
}

/**
 * filter reviews by a start date
 * @param {Array<{date:string}>} reviews
 * @param {string} startDateStr 
 * @returns {Array}
 */
export function filterReviewsFromDate(reviews, startDateStr) {
  return filterReviewsByDateRange(reviews, startDateStr, '9999-12-31');
}

/**
 * Sort reviews by their 'date' 
 * 
 * @param {Array<{date:string}>} reviews
 * @returns {Array}
 */
export function sortReviewsByDateAscending(reviews) {
  return (Array.isArray(reviews) ? reviews : []).sort((a, b) => {
    const da = toDate(a?.date) ?? new Date(0);
    const db = toDate(b?.date) ?? new Date(0);
    return da - db;
  });
}

/**
 * Save reviews to json format
 * @param {string} sourceName 
 * @param {string} company   
 * @param {Array} reviews
 * @param {{dir?: string, pretty?: number}} opts
 */
export function saveFilteredReviews(sourceName, company, reviews, opts = {}) {
  const { dir = path.join('data', 'filter'), pretty = 2 } = opts;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `${String(sourceName).toLowerCase()}_${company}_filtered_sorted.json`;
  const fullPath = path.join(dir, fileName);

  fs.writeFileSync(fullPath, JSON.stringify(reviews ?? [], null, pretty));
  console.log(` ${sourceName} filtered & sorted reviews saved to ${fullPath}`);
}

/**
 * log reviews summary
 * @param {string} label
 * @param {Array<{date:string}>} reviews
 */
export function logReviewsSummary(label, reviews) {
  const arr = Array.isArray(reviews) ? reviews : [];
  const count = arr.length;
  const dates = arr
    .map((r) => toDate(r.date))
    .filter(Boolean)
    .sort((a, b) => a - b);

  const first = dates[0] ? dates[0].toISOString().slice(0, 10) : '—';
  const last = dates[dates.length - 1] ? dates[dates.length - 1].toISOString().slice(0, 10) : '—';

  console.log(`${label} — count: ${count}, range: ${first} → ${last}`);
}
