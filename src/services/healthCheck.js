// App health checks — runs on every boot to ensure data integrity
// 1. Auto-expire documents past their expiry date
// 2. Remove orphaned image references
// 3. Reconcile entity/docType references

const { daysUntil } = require('../domain/expiry');

/**
 * Runs all health checks against the app state.
 * Returns a new state object if any repairs were made, or the same state if clean.
 */
function runHealthChecks(state) {
  let repaired = false;
  let nextState = { ...state };

  // 1. Auto-mark documents as "Expired" if past their expiry date and still "Active"
  const reconciledRecords = nextState.documentRecords.map(record => {
    if (record.status !== "Active") return record;
    const remaining = daysUntil(record.expiryDate);
    if (remaining !== null && remaining < 0) {
      repaired = true;
      return { ...record, status: "Expired" };
    }
    return record;
  });
  nextState.documentRecords = reconciledRecords;

  // 2. Remove orphaned images (images whose documentRecordId doesn't match any record)
  const recordIds = new Set(nextState.documentRecords.map(r => r.id));
  const cleanedImages = (nextState.images || []).filter(img => {
    if (img.documentRecordId && !recordIds.has(img.documentRecordId)) {
      repaired = true;
      return false;
    }
    return true;
  });
  nextState.images = cleanedImages;

  // 3. Deactivate entities whose entityType no longer exists
  const entityTypeIds = new Set(nextState.entityTypes.map(t => t.id));
  const reconciledEntities = nextState.entities.map(entity => {
    if (entity.active && entity.entityTypeId && !entityTypeIds.has(entity.entityTypeId)) {
      repaired = true;
      return { ...entity, active: false };
    }
    return entity;
  });
  nextState.entities = reconciledEntities;

  if (repaired) {
    console.log("[HealthCheck] Repaired inconsistencies on boot.");
  }

  return { state: nextState, repaired };
}

module.exports = { runHealthChecks };
