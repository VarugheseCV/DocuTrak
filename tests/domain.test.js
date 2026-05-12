const test = require("node:test");
const assert = require("node:assert/strict");
const { createInitialState } = require("../src/data/seeds");
const {
  buildExpiryReport,
  daysUntil,
  formatDateInputValue,
  filterRows,
  isExpiringWithin,
  normalizeText,
  parseDateInputValue,
  sortRows
} = require("../src/domain/documents");
const { createBackupPayload, validateBackupPayload } = require("../src/domain/backup");
const { runHealthChecks } = require("../src/services/healthCheck");

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

test("isExpiringWithin: identifies records expiring within the alert window", () => {
  const now = new Date("2026-05-01T10:00:00");
  const alertDays = 30;

  // Within window (15 days left)
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "2026-05-16" }, alertDays, now),
    true
  );

  // Exactly at boundary (30 days left)
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "2026-05-31" }, alertDays, now),
    true
  );

  // Just outside window (31 days left)
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "2026-06-01" }, alertDays, now),
    false
  );

  // Expiring today (0 days left)
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "2026-05-01" }, alertDays, now),
    true
  );

  // Already expired (-1 day left)
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "2026-04-30" }, alertDays, now),
    false
  );

  // Inactive record should be false
  assert.strictEqual(
    isExpiringWithin({ status: "Inactive", expiryDate: "2026-05-10" }, alertDays, now),
    false
  );

  // Invalid expiry date
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "invalid-date" }, alertDays, now),
    false
  );

  // Default alert window (30 days)
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "2026-05-31" }, undefined, now),
    true
  );
  assert.strictEqual(
    isExpiringWithin({ status: "Active", expiryDate: "2026-06-01" }, undefined, now),
    false
  );
});

test("daysUntil: returns null for invalid dates", () => {
  assert.equal(daysUntil("invalid-date"), null);
  assert.equal(daysUntil(""), null);
  assert.equal(daysUntil(undefined), null);
  assert.equal(daysUntil(null), null);
});

test("normalizeText: trims whitespace and handles non-string values", () => {
  assert.strictEqual(normalizeText("  hello  "), "hello");
  assert.strictEqual(normalizeText(null), "");
  assert.strictEqual(normalizeText(undefined), "");
  assert.strictEqual(normalizeText(""), "");
  assert.strictEqual(normalizeText(123), "123");
  assert.strictEqual(normalizeText(0), "0");
  assert.strictEqual(normalizeText(false), "false");
});

test("health checks keep expired documents active for computed dashboard display", () => {
  const state = createInitialState();
  state.documentRecords = [
    {
      id: "expired-active",
      entityId: "entity-1",
      documentTypeId: "document-type-1",
      expiryDate: "2026-04-30",
      status: "Active",
      imageIds: []
    }
  ];

  const result = runHealthChecks(state);

  assert.equal(result.repaired, false);
  assert.equal(result.state.documentRecords[0].status, "Active");
});

test("health checks repair legacy persisted Expired statuses", () => {
  const state = createInitialState();
  state.documentRecords = [
    {
      id: "legacy-expired",
      entityId: "entity-1",
      documentTypeId: "document-type-1",
      expiryDate: "2026-04-30",
      status: "Expired",
      imageIds: []
    }
  ];

  const result = runHealthChecks(state);

  assert.equal(result.repaired, true);
  assert.equal(result.state.documentRecords[0].status, "Active");
});

test("health checks reconcile legacy image ownership and remove orphaned images", () => {
  const state = createInitialState();
  state.documentRecords = [
    {
      id: "record-1",
      entityId: "entity-1",
      documentTypeId: "document-type-1",
      expiryDate: "2026-06-01",
      status: "Active",
      imageIds: ["image-kept"]
    }
  ];
  state.images = [
    { id: "image-kept", uri: "file://kept.jpg" },
    { id: "image-orphan", uri: "file://orphan.jpg" }
  ];

  const result = runHealthChecks(state);

  assert.equal(result.repaired, true);
  assert.deepEqual(result.state.images, [
    { id: "image-kept", uri: "file://kept.jpg", documentRecordId: "record-1" }
  ]);
});

test("date input helpers preserve local calendar dates", () => {
  const value = "2026-05-13";
  const parsed = parseDateInputValue(value);

  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 4);
  assert.equal(parsed.getDate(), 13);
  assert.equal(formatDateInputValue(new Date(2026, 4, 13)), value);
});
