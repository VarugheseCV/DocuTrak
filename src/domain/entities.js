const { daysUntil } = require("./documents");

function getEntityIcon(typeName) {
  if (!typeName) return "cube";
  const t = typeName.toLowerCase();
  if (t.includes("individual") || t.includes("person")) return "person";
  if (t.includes("vehicle") || t.includes("car")) return "car";
  if (t.includes("property") || t.includes("land") || t.includes("flat") || t.includes("building") || t.includes("house")) return "business";
  if (t.includes("company") || t.includes("business")) return "briefcase";
  if (t.includes("employee")) return "people";
  return "folder";
}

function getEntitySummary(entityId, state, now = new Date()) {
  const alertDays = Number(state.profile?.alertDays || 30);
  const docs = state.documentRecords.filter(d => d.entityId === entityId && d.status === "Active");
  let expiring = 0;
  let expired = 0;

  docs.forEach(doc => {
    const diff = daysUntil(doc.expiryDate, now);
    if (diff !== null) {
      if (diff < 0) expired++;
      else if (diff <= alertDays) expiring++;
    }
  });

  return { totalDocs: docs.length, expiring, expired };
}

function getEntityStatusColor(summary, colors) {
  if (summary.expired > 0) return colors.danger;
  if (summary.expiring > 0) return colors.warning;
  if (summary.totalDocs === 0) return colors.textMuted;
  return colors.success;
}

module.exports = { getEntityIcon, getEntitySummary, getEntityStatusColor };
