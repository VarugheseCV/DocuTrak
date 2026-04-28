import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { daysUntil } from '../domain/documents';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';

export default function EntityDetailScreen() {
  const { state, colors } = useAppState();
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
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const renderItem = useCallback(({ item }) => {
    const isExpired = item.daysRemaining < 0;
    const isExpiringSoon = item.daysRemaining >= 0 && item.daysRemaining <= (state.profile?.alertDays || 30);

    let statusColor = colors.success;
    if (isExpired) statusColor = colors.danger;
    else if (isExpiringSoon) statusColor = colors.warning;

    return (
      <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.surface }]} onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })}>
        <View style={styles.itemLeft}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.documentType?.name || "Document"}</Text>
          <Text style={[styles.itemDate, { color: statusColor }]}>{item.expiryDate}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }, [state, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader 
        title={entity.name} 
        onBack={() => navigate(ROUTES.ENTITIES)} 
        rightAction={
          <TouchableOpacity onPress={() => navigate(ROUTES.ADD_ENTITY, { editEntityId: entity.id })}>
            <Ionicons name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListEmptyComponent={<EmptyState icon="document-outline" title="No documents found" subtitle="Tap + to add a document for this entity." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  listItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 12, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemDate: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
});
