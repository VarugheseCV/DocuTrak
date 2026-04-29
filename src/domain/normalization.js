// Text normalization and ID generation utilities

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

module.exports = { createId, normalizeText };
