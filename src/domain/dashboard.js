import { daysUntil } from './documents';

const MAX_PER_GROUP = 5;

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
  
  function pushGroup(items, title, key) {
    if (items.length === 0) return;
    const capped = items.length > MAX_PER_GROUP;
    sections.push({ type: 'sectionHeader', title, key, total: items.length, capped });
    const visible = capped ? items.slice(0, MAX_PER_GROUP) : items;
    visible.forEach(d => sections.push({ type: 'doc', ...d, key: `doc-${d.id}` }));
    if (capped) {
      sections.push({ type: 'viewAll', title, key: `viewall-${key}`, remaining: items.length - MAX_PER_GROUP, allItems: items.slice(MAX_PER_GROUP) });
    }
  }

  pushGroup(exp, 'Expired', 'h-expired');

  if (soon.length > 0) {
    const today = soon.filter(r => r.daysRemaining === 0);
    const thisWeek = soon.filter(r => r.daysRemaining > 0 && r.daysRemaining <= 7);
    const thisMonth = soon.filter(r => r.daysRemaining > 7 && r.daysRemaining <= 30);
    const later = soon.filter(r => r.daysRemaining > 30);

    pushGroup(today, 'Expiring Today', 'h-today');
    pushGroup(thisWeek, 'Expiring This Week', 'h-thisweek');
    pushGroup(thisMonth, 'Expiring This Month', 'h-thismonth');
    pushGroup(later, 'Expiring Later', 'h-later');
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
