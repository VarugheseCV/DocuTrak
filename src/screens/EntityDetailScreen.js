import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { daysUntil } from '../domain/documents';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';

export default function EntityDetailScreen() {
  const { state } = useAppState();
  const navigate = useAppNavigation();
  const params = useScreenParams();

  const entity = state.entities.find(e => e.id === params.id);
  if (!entity) return null;

  const records = state.documentRecords
    .filter(r => r.entityId === entity.id && r.status === "Active")
    .map(record => ({
      ...record,
      documentType: state.documentTypes.find(dt => dt.id === record.documentTypeId),
      daysRemaining: daysUntil(record.expiryDate),
    }))
    .sort((a, b) => {
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;
      return a.daysRemaining - b.daysRemaining;
    });

  const renderItem = useCallback(({ item }) => {
    const isExpired = item.daysRemaining !== null && item.daysRemaining < 0;
    const isExpiringSoon = item.daysRemaining !== null && item.daysRemaining >= 0 && item.daysRemaining <= (state.profile?.alertDays || 30);

    let statusColor = colors.success;
    if (isExpired) statusColor = colors.danger;
    else if (isExpiringSoon) statusColor = colors.warning;

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemName}>{item.documentType?.name || "Document"}</Text>
          <Text style={[styles.itemDate, { color: statusColor }]}>{item.expiryDate}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }, [state]);

  return (
    <View style={styles.container}>
      <ScreenHeader title={entity.name} onBack={() => navigate(ROUTES.ENTITIES)} />

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListEmptyComponent={<EmptyState icon="document-outline" title="No documents found" subtitle="Tap + to add a document for this entity." />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigate(ROUTES.ADD_DOCUMENT, { entityId: entity.id })}>
        <Ionicons name="add" size={30} color={colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  listItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.text },
  itemDate: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
