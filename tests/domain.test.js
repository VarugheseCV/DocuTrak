const test = require("node:test");
const assert = require("node:assert/strict");
const { createInitialState } = require("../src/data/seeds");
const {
  buildExpiryReport,
  daysUntil,
  filterRows,
  findDuplicateDocumentRecord,
  sortRows
} = require("../src/domain/documents");
const { createBackupPayload, validateBackupPayload } = require("../src/domain/backup");

test("detects duplicate active document records for the same entity and document", () => {
  const records = [
    {
      id: "record-1",
      entityId: "entity-1",
      documentTypeId: "document-type-1",
      expiryDate: "2026-06-01",
      status: "Active"
    }
  ];
  const duplicate = findDuplicateDocumentRecord(records, {
    entityId: "entity-1",
    documentTypeId: "document-type-1",
    status: "Active"
  });

  assert.equal(duplicate.id, "record-1");
});

test("ignores inactive records when checking duplicates", () => {
  const records = [
    {
      id: "record-1",
      entityId: "entity-1",
      documentTypeId: "document-type-1",
      expiryDate: "2026-06-01",
      status: "In-Active"
    }
  ];

  assert.equal(
    findDuplicateDocumentRecord(records, {
      entityId: "entity-1",
      documentTypeId: "document-type-1",
      status: "Active"
    }),
    undefined
  );
});

test("calculates expiry windows from whole calendar days", () => {
  assert.equal(daysUntil("2026-05-27", new Date("2026-04-27T18:00:00")), 30);
});

test("builds expiry report sorted by nearest active expiry", () => {
  const state = createInitialState();
  state.profile.alertDays = 30;
  state.documentRecords = [
    {
      id: "late",
      entityId: "entity-1",
      documentTypeId: "document-type-1",
      expiryDate: "2026-05-20",
      status: "Active",
      imageIds: []
    },
    {
      id: "soon",
      entityId: "entity-2",
      documentTypeId: "document-type-2",
      expiryDate: "2026-05-01",
      status: "Active",
      imageIds: []
    }
  ];

  assert.deepEqual(
    buildExpiryReport(state, new Date("2026-04-27T10:00:00")).map((item) => item.id),
    ["soon", "late"]
  );
});

test("filters and sorts rows by any visible text", () => {
  const rows = [
    { name: "Passport", owner: "Varghese" },
    { name: "Visa", owner: "Suma" }
  ];

  assert.deepEqual(filterRows(rows, "suma"), [{ name: "Visa", owner: "Suma" }]);
  assert.deepEqual(sortRows(rows, "name", "desc").map((row) => row.name), ["Visa", "Passport"]);
});

test("creates and validates schema-versioned backups", () => {
  const state = createInitialState();
  const payload = createBackupPayload(state, "1.0.0");

  assert.equal(payload.manifest.schemaVersion, 1);
  assert.equal(payload.manifest.recordCounts.entityTypes, state.entityTypes.length);
  assert.equal(validateBackupPayload(payload), null);
});

test("rejects malformed backups", () => {
  assert.match(validateBackupPayload({ manifest: { schemaVersion: 1 }, data: {} }), /missing entityTypes/);
});
