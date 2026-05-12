// App health checks — runs on every boot to ensure data integrity
// 1. Normalize legacy document statuses
// 2. Remove orphaned image references
// 3. Reconcile entity/docType references

/**
 * Runs all health checks against the app state.
 * Returns a new state object if any repairs were made, or the same state if clean.
 */
function runHealthChecks(state) {
  let repaired = false;
  let nextState = { ...state };

  // "Expired" is a computed display state. Persisting it hides records from
  // active tracking lists that intentionally filter only deleted documents out.
  const reconciledRecords = nextState.documentRecords.map(record => {
    if (record.status === "Expired") {
      repaired = true;
      return { ...record, status: "Active" };
    }
    return record;
  });
  nextState.documentRecords = reconciledRecords;

  // 2. Remove orphaned images and backfill their owning record reference.
  const recordIds = new Set(nextState.documentRecords.map(r => r.id));
  const imageRecordIds = new Map();
  for (const record of nextState.documentRecords) {
    for (const imageId of record.imageIds || []) {
      imageRecordIds.set(imageId, record.id);
    }
  }

  const cleanedImages = (nextState.images || []).reduce((images, img) => {
    const documentRecordId = imageRecordIds.get(img.id);
    if (!documentRecordId || !recordIds.has(documentRecordId)) {
      repaired = true;
      return images;
    }
    if (img.documentRecordId !== documentRecordId) {
      repaired = true;
      images.push({ ...img, documentRecordId });
      return images;
    }
    images.push(img);
    return images;
  }, []);
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
