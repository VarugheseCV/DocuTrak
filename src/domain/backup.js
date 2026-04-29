const { SCHEMA_VERSION } = require("../data/seeds");

function createBackupPayload(state, appVersion = "1.0.0") {
  const data = {
    ...state,
    schemaVersion: state.schemaVersion || SCHEMA_VERSION
  };
  const manifest = {
    schemaVersion: data.schemaVersion,
    createdAt: new Date().toISOString(),
    appVersion,
    recordCounts: {
      entityTypes: data.entityTypes.length,
      entities: data.entities.length,
      documentTypes: data.documentTypes.length,
      documentRecords: data.documentRecords.length
    },
    imageCount: data.images.length
  };
  return {
    manifest,
    data
  };
}

function validateBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Backup file is not readable.";
  }
  if (!payload.manifest || !payload.data) {
    return "Backup file is missing its manifest or data.";
  }
  if (payload.manifest.schemaVersion > SCHEMA_VERSION) {
    return `Backup is from a newer version of DocuTrak. Please update your app.`;
  }
  const requiredArrays = ["entityTypes", "entities", "documentTypes", "documentRecords", "images"];
  const missing = requiredArrays.find((key) => !Array.isArray(payload.data[key]));
  if (missing) {
    return `Backup file is missing ${missing}.`;
  }
  return null;
}

module.exports = {
  createBackupPayload,
  validateBackupPayload
};
