import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { performDocumentDeletion } from '../services/documentService';
import { getDashboardSummary } from '../domain/dashboard';
import { useAppState } from '../context/AppContext';
import { useToast } from '../components/glass/Toast';
import GlassButton from '../components/glass/GlassButton';
import GlassScreen from '../components/glass/GlassScreen';
import ConfirmSheet from '../components/glass/ConfirmSheet';
import EmptyState from '../components/EmptyState';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SectionHeader from '../components/dashboard/SectionHeader';
import DocumentCard from '../components/dashboard/DocumentCard';

export default function DashboardScreen() {
  const { state, commit, colors, isDark, toggleTheme } = useAppState();
  const { showToast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const alertDays = Number(state.profile?.alertDays || 30);

  const summary = useMemo(() => getDashboardSummary(state, alertDays), [state, alertDays]);
  const { sections } = summary;

  const handleDeleteRecord = useCallback((recordId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingDeleteId(recordId);
  }, []);

  const confirmDeleteRecord = useCallback(async () => {
    if (!pendingDeleteId) return;
    const nextState = await performDocumentDeletion(pendingDeleteId, state);
    await commit(nextState);
    setPendingDeleteId(null);
    showToast('Document removed');
  }, [pendingDeleteId, state, commit, showToast]);

  const renderItem = useCallback(({ item, index }) => {
    if (item.type === 'sectionHeader') return <SectionHeader title={item.title} />;
    if (item.type === 'empty') return <EmptyState icon="documents-outline" title="No documents tracked" subtitle="Tap the + button to add your first document." />;
    return <DocumentCard item={item} index={index} onDelete={handleDeleteRecord} />;
  }, [handleDeleteRecord]);

  const ListHeader = useCallback(() => (
    <DashboardHeader summary={summary} alertDays={alertDays} />
  ), [summary, alertDays]);

  return (
    <GlassScreen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: colors.primary }]}>DOCUTRAK</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        </View>
        <GlassButton
          onPress={toggleTheme}
          accessibilityLabel={isDark ? "Switch to light theme" : "Switch to dark theme"}
          style={styles.headerIconBg}
          contentStyle={styles.headerIconContent}
        >
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={colors.text} />
        </GlassButton>
      </View>

      <FlatList
        ListHeaderComponent={ListHeader}
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
      <ConfirmSheet
        visible={!!pendingDeleteId}
        title="Delete document?"
        message="This removes the document from active tracking and deletes its attached images from local storage."
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDeleteRecord}
      />
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 15,
  },
  brand: { fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '900' },
  headerIconBg: {
    width: 48,
    height: 48,
  },
  headerIconContent: {
    width: 48,
    height: 48,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: { padding: 20, paddingBottom: 40 },
});
