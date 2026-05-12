// Barrel file — re-exports from focused domain modules for backwards compatibility.
// New code should import directly from the specific module:
//   import { daysUntil } from '../domain/expiry';
//   import { createId } from '../domain/normalization';

const { createId, normalizeText } = require('./normalization');
const { daysUntil, isExpiringWithin, formatRelativeExpiryDate } = require('./expiry');
const { buildExpiryReport } = require('./reports');
const { sortRows, filterRows } = require('./filters');
const { formatDateInputValue, parseDateInputValue } = require('./dates');

module.exports = {
  createId,
  normalizeText,
  daysUntil,
  isExpiringWithin,
  buildExpiryReport,
  sortRows,
  filterRows,
  formatRelativeExpiryDate,
  formatDateInputValue,
  parseDateInputValue
};
