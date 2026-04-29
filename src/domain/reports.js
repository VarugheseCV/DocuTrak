// Expiry report generation for notifications, dashboard, and exports

const { daysUntil, isExpiringWithin } = require('./expiry');

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

module.exports = { buildExpiryReport };
