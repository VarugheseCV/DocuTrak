import { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { performDocumentDeletion } from '../services/documentService';
import { getDashboardSummary } from '../domain/dashboard';
import { useAppState } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SectionHeader from '../components/dashboard/SectionHeader';
import DocumentCard from '../components/dashboard/DocumentCard';

export default function DashboardScreen() {
  const { state, commit, colors, isDark, toggleTheme } = useAppState();
  const alertDays = Number(state.profile?.alertDays || 30);

  const summary = useMemo(() => getDashboardSummary(state, alertDays), [state.documentRecords, state.entities, state.documentTypes, alertDays]);
  const { expired, expiringSoon } = summary;

  function handleDeleteRecord(recordId) {
    Alert.alert("Delete Document", "Are you sure you want to remove this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const nextState = await performDocumentDeletion(recordId, state);
          commit(nextState);
        },
      },
    ]);
  }

  const renderItem = useCallback(({ item }) => {
    if (item.type === 'sectionHeader') return <SectionHeader title={item.title} />;
    if (item.type === 'empty') return <EmptyState icon="documents-outline" title="No documents tracked" subtitle="Tap the + button to add your first document." />;
    return <DocumentCard item={item} onDelete={handleDeleteRecord} />;
  }, [handleDeleteRecord]);

  const ListHeader = useCallback(() => (
    <DashboardHeader summary={summary} alertDays={alertDays} />
  ), [summary, alertDays]);

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
