function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function daysUntil(dateText, now = new Date()) {
  const expiry = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) {
    return null;
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
}

function isExpiringWithin(record, alertDays, now = new Date()) {
  if (record.status !== "Active") {
    return false;
  }
  const remaining = daysUntil(record.expiryDate, now);
  return remaining !== null && remaining >= 0 && remaining <= Number(alertDays || 30);
}

function buildExpiryReport(state, now = new Date()) {
  const alertDays = Number(state.profile?.alertDays || 30);

  const expiringRecords = state.documentRecords.filter((record) => isExpiringWithin(record, alertDays, now));

  if (expiringRecords.length === 0) {
    return [];
  }

  const entityMap = new Map();
  for (const entity of state.entities || []) {
    entityMap.set(entity.id, entity);
  }

  const documentTypeMap = new Map();
  for (const type of state.documentTypes || []) {
    documentTypeMap.set(type.id, type);
  }

  return expiringRecords
    .map((record) => ({
      ...record,
      entity: entityMap.get(record.entityId),
      documentType: documentTypeMap.get(record.documentTypeId),
      daysRemaining: daysUntil(record.expiryDate, now)
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

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

module.exports = {
  createId,
  normalizeText,
  daysUntil,
  isExpiringWithin,
  buildExpiryReport,
  sortRows,
  filterRows
};
