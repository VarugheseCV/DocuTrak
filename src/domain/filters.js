// Generic sorting and filtering utilities for data rows

const { normalizeText } = require('./normalization');

function sortRows(rows, key, direction = "asc") {
  const multiplier = direction === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const left = String(a[key] || "").toLowerCase();
    const right = String(b[key] || "").toLowerCase();
    return left.localeCompare(right) * multiplier;
  });
}

function filterRows(rows, query) {
  const needle = normalizeText(query).toLowerCase();
  if (!needle) {
    return rows;
  }
  return rows.filter((row) =>
    Object.values(row).some((value) => String(value || "").toLowerCase().includes(needle))
  );
}

module.exports = { sortRows, filterRows };
