import { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteDocumentImages } from '../services/documentService';
import { daysUntil } from '../domain/documents';
import { useAppState } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import HeroBanner from '../components/dashboard/HeroBanner';
import StatsRow from '../components/dashboard/StatsRow';
import QuickActions from '../components/dashboard/QuickActions';
import AdSlot from '../components/dashboard/AdSlot';
import SectionHeader from '../components/dashboard/SectionHeader';
import DocumentCard from '../components/dashboard/DocumentCard';

export default function DashboardScreen() {
  const { state, commit, colors, isDark, toggleTheme } = useAppState();
  const alertDays = Number(state.profile?.alertDays || 30);

  // --- Derived state (memoized for performance) ---
  const { activeRecords, expiringSoon, expired } = useMemo(() => {
    // 1. Build maps for O(1) lookups
    const entityMap = new Map(state.entities.map(e => [e.id, e]));
    const typeMap = new Map(state.documentTypes.map(dt => [dt.id, dt]));

    // 2. Filter and map records using the maps
    const active = state.documentRecords
      .filter(r => r.status === "Active")
      .map(r => ({
        ...r,
        entity: entityMap.get(r.entityId),
        documentType: typeMap.get(r.documentTypeId),
        daysRemaining: daysUntil(r.expiryDate),
      }))
      .filter(r => r.daysRemaining !== null);

    // 3. Compute soon and expired
    const soon = active
      .filter(r => r.daysRemaining >= 0 && r.daysRemaining <= alertDays)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const exp = active
      .filter(r => r.daysRemaining < 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { activeRecords: active, expiringSoon: soon, expired: exp };
  }, [state.documentRecords, state.entities, state.documentTypes, alertDays]);

  const totalEntities = state.entities.filter(e => e.active).length;
  const totalUrgent = expiringSoon.length + expired.length;
  const nextExpiry = expiringSoon[0] || expired[0];

  // --- Handlers ---
  function handleDeleteRecord(recordId) {
    Alert.alert("Delete Document", "Are you sure you want to remove this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const record = state.documentRecords.find(r => r.id === recordId);
          if (record && record.imageIds && record.imageIds.length > 0) {
            await deleteDocumentImages(record.imageIds, state.images);
            commit({
              ...state,
              documentRecords: state.documentRecords.map(r => r.id === recordId ? { ...r, status: "In-Active" } : r),
              images: state.images.filter(img => !record.imageIds.includes(img.id)),
            });
          } else {
            commit({
              ...state,
              documentRecords: state.documentRecords.map(r => r.id === recordId ? { ...r, status: "In-Active" } : r),
            });
          }
        },
      },
    ]);
  }

  // --- Render helpers ---
  const renderItem = useCallback(({ item }) => {
    if (item.type === 'sectionHeader') return <SectionHeader title={item.title} />;
    if (item.type === 'empty') return <EmptyState icon="documents-outline" title="No documents tracked" subtitle="Tap the + button to add your first document." />;
    return <DocumentCard item={item} onDelete={handleDeleteRecord} />;
  }, [handleDeleteRecord]);

  const ListHeader = useCallback(() => (
    <>
      <HeroBanner 
        totalUrgent={totalUrgent} 
        nextExpiry={nextExpiry} 
        alertDays={alertDays} 
        expiredCount={expired.length} 
        expiringSoonCount={expiringSoon.length} 
      />
      <StatsRow 
        totalEntities={totalEntities} 
        expiringSoonCount={expiringSoon.length} 
        expiredCount={expired.length} 
      />
      <QuickActions />
      <AdSlot />
    </>
  ), [totalUrgent, nextExpiry, alertDays, expired.length, expiringSoon.length, totalEntities]);

  // --- Construct list sections ---
  const sections = [];
  if (expired.length > 0) {
    sections.push({ type: 'sectionHeader', title: 'Expired Documents', key: 'h-expired' });
    expired.forEach(d => sections.push({ type: 'doc', ...d, key: `doc-${d.id}` }));
  }
  if (expiringSoon.length > 0) {
    sections.push({ type: 'sectionHeader', title: 'Expiring Soon', key: 'h-expiring' });
    expiringSoon.forEach(d => sections.push({ type: 'doc', ...d, key: `doc-${d.id}` }));
  }
  if (sections.length === 0) {
    sections.push({ type: 'empty', key: 'empty' });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: colors.primary }]}>DOCUTRAK</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={[styles.headerIconBg, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={ListHeader}
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 15,
  },
  brand: { fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '900' },
  headerIconBg: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  content: { padding: 20, paddingBottom: 40 },
});
