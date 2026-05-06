const test = require("node:test");
const assert = require("node:assert/strict");
const { getEntityStatusColor, getEntityIcon, getEntitySummary } = require("../src/domain/entities.js");

const mockColors = {
  danger: "red",
  warning: "orange",
  textMuted: "gray",
  success: "green"
};

test("getEntityStatusColor: returns correct colors based on summary", () => {
  // Priority 1: Expired
  assert.strictEqual(getEntityStatusColor({ totalDocs: 5, expiring: 2, expired: 1 }, mockColors), mockColors.danger);

  // Priority 2: Expiring
  assert.strictEqual(getEntityStatusColor({ totalDocs: 5, expiring: 1, expired: 0 }, mockColors), mockColors.warning);

  // Priority 3: No docs
  assert.strictEqual(getEntityStatusColor({ totalDocs: 0, expiring: 0, expired: 0 }, mockColors), mockColors.textMuted);

  // Priority 4: All good
  assert.strictEqual(getEntityStatusColor({ totalDocs: 5, expiring: 0, expired: 0 }, mockColors), mockColors.success);
});

test("getEntityIcon: returns correct icon name based on type", () => {
  assert.strictEqual(getEntityIcon("Individual"), "person");
  assert.strictEqual(getEntityIcon("Person"), "person");
  assert.strictEqual(getEntityIcon("Vehicle"), "car");
  assert.strictEqual(getEntityIcon("Car"), "car");
  assert.strictEqual(getEntityIcon("Property"), "business");
  assert.strictEqual(getEntityIcon("Land"), "business");
  assert.strictEqual(getEntityIcon("Flat"), "business");
  assert.strictEqual(getEntityIcon("Building"), "business");
  assert.strictEqual(getEntityIcon("House"), "business");
  assert.strictEqual(getEntityIcon("Company"), "briefcase");
  assert.strictEqual(getEntityIcon("Business"), "briefcase");
  assert.strictEqual(getEntityIcon("Employee"), "people");
  assert.strictEqual(getEntityIcon("Other"), "folder");
  assert.strictEqual(getEntityIcon(null), "cube");
  assert.strictEqual(getEntityIcon(""), "cube");
});

test("getEntitySummary: calculates summary correctly", () => {
  const now = new Date("2026-05-01T10:00:00");
  const entityId = "e1";
  const state = {
    profile: { alertDays: 30 },
    documentRecords: [
      { entityId: "e1", status: "Active", expiryDate: "2026-04-30" }, // Expired
      { entityId: "e1", status: "Active", expiryDate: "2026-05-15" }, // Expiring (14 days)
      { entityId: "e1", status: "Active", expiryDate: "2026-06-10" }, // Safe (40 days)
      { entityId: "e1", status: "Inactive", expiryDate: "2026-04-30" }, // Ignored (Inactive)
      { entityId: "e2", status: "Active", expiryDate: "2026-04-30" }, // Ignored (Wrong Entity)
    ]
  };

  const summary = getEntitySummary(entityId, state, now);
  assert.deepEqual(summary, {
    totalDocs: 3, // Only Active docs for e1
    expiring: 1,
    expired: 1
  });

  // Test with no docs
  assert.deepEqual(getEntitySummary("e3", state, now), {
    totalDocs: 0,
    expiring: 0,
    expired: 0
  });

  // Test default alertDays
  const stateNoAlertDays = {
    profile: {},
    documentRecords: [
      { entityId: "e1", status: "Active", expiryDate: "2026-05-31" }, // Expiring (30 days)
      { entityId: "e1", status: "Active", expiryDate: "2026-06-01" }, // Safe (31 days)
    ]
  };
  const summaryDefault = getEntitySummary("e1", stateNoAlertDays, now);
  assert.strictEqual(summaryDefault.expiring, 1);
});
