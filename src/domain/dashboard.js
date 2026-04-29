import { daysUntil } from './documents';

export function getDashboardSummary(state, alertDays = 30) {
  const entityMap = new Map(state.entities.map(e => [e.id, e]));
  const typeMap = new Map(state.documentTypes.map(dt => [dt.id, dt]));

  const active = state.documentRecords
    .filter(r => r.status === "Active")
    .map(r => ({
      ...r,
      entity: entityMap.get(r.entityId),
      documentType: typeMap.get(r.documentTypeId),
      daysRemaining: daysUntil(r.expiryDate),
    }))
    .filter(r => r.daysRemaining !== null);

  const soon = active
    .filter(r => r.daysRemaining >= 0 && r.daysRemaining <= alertDays)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const exp = active
    .filter(r => r.daysRemaining < 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const sections = [];
  if (exp.length > 0) {
    sections.push({ type: 'sectionHeader', title: 'Expired Documents', key: 'h-expired' });
    exp.forEach(d => sections.push({ type: 'doc', ...d, key: `doc-${d.id}` }));
  }
  if (soon.length > 0) {
    sections.push({ type: 'sectionHeader', title: 'Expiring Soon', key: 'h-expiring' });
    soon.forEach(d => sections.push({ type: 'doc', ...d, key: `doc-${d.id}` }));
  }
  if (sections.length === 0) {
    sections.push({ type: 'empty', key: 'empty' });
  }

  return {
    activeRecords: active,
    expiringSoon: soon,
    expired: exp,
    sections,
    totalEntities: state.entities.filter(e => e.active).length,
    totalUrgent: soon.length + exp.length,
    nextExpiry: soon[0] || exp[0],
  };
}
