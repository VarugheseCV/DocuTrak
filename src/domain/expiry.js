// Expiry date calculations and human-readable formatting

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

function formatRelativeExpiryDate(daysRemaining) {
  if (daysRemaining === null || daysRemaining === undefined) return "";
  
  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    if (daysAgo === 1) return "Expired yesterday";
    if (daysAgo < 7) return `Expired ${daysAgo} days ago`;
    if (daysAgo < 30) {
      const weeks = Math.floor(daysAgo / 7);
      return `Expired ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(daysAgo / 30);
    return `Expired ${months} month${months > 1 ? 's' : ''} ago`;
  }
  
  if (daysRemaining === 0) return "Expires today";
  if (daysRemaining === 1) return "Expires tomorrow";
  if (daysRemaining < 7) return `Expires in ${daysRemaining} days`;
  if (daysRemaining < 30) {
    const weeks = Math.floor(daysRemaining / 7);
    return `Expires in ${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  const months = Math.floor(daysRemaining / 30);
  return `Expires in ${months} month${months > 1 ? 's' : ''}`;
}

module.exports = { daysUntil, isExpiringWithin, formatRelativeExpiryDate };
