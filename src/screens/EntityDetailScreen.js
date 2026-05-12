import { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { daysUntil, formatRelativeExpiryDate } from '../domain/documents';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader, { HeaderIconButton } from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import GlassScreen from '../components/glass/GlassScreen';
import GlassSurface from '../components/glass/GlassSurface';

export default function EntityDetailScreen() {
  const { state, colors } = useAppState();
  const navigate = useAppNavigation();
  const params = useScreenParams();

  const entity = state.entities.find(e => e.id === params.id);
  if (!entity) return null;

  const records = useMemo(() => {
    const documentTypeMap = new Map();
    state.documentTypes.forEach(dt => documentTypeMap.set(dt.id, dt));

    return state.documentRecords
      .filter(r => r.entityId === entity.id && r.status === "Active")
      .map(record => ({
        ...record,
        documentType: documentTypeMap.get(record.documentTypeId),
        daysRemaining: daysUntil(record.expiryDate),
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [state.documentRecords, state.documentTypes, entity.id]);

  const renderItem = useCallback(({ item }) => {
    const isExpired = item.daysRemaining < 0;
    const isExpiringSoon = item.daysRemaining >= 0 && item.daysRemaining <= (state.profile?.alertDays || 30);
    const statusColor = isExpired ? colors.danger : isExpiringSoon ? colors.warning : colors.success;
    const statusFill = isExpired ? colors.dangerGlass : isExpiringSoon ? colors.warningGlass : colors.successGlass;

    return (
      <TouchableOpacity
        activeOpacity={0.76}
        onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })}
        accessibilityRole="button"
        accessibilityLabel={item.documentType?.name || "Document"}
      >
        <GlassSurface blur={false} strong style={styles.listItem} contentStyle={styles.listContent}>
          <View style={[styles.iconBox, { backgroundColor: statusFill }]}>
            <Ionicons name="document-text" size={21} color={statusColor} />
          </View>
          <View style={styles.itemLeft}>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.documentType?.name || "Document"}</Text>
            <Text style={[styles.itemDate, { color: statusColor }]} numberOfLines={1}>
              {item.daysRemaining !== null ? formatRelativeExpiryDate(item.daysRemaining) : item.expiryDate}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </GlassSurface>
      </TouchableOpacity>
    );
  }, [state.profile?.alertDays, colors, navigate]);

  return (
    <GlassScreen>
      <ScreenHeader
        title={entity.name}
        onBack={() => navigate(ROUTES.ENTITIES)}
        rightAction={
          <View style={styles.headerActions}>
            <HeaderIconButton icon="add" onPress={() => navigate(ROUTES.ADD_DOCUMENT, { entityId: entity.id })} accessibilityLabel="Add document for this entity" color={colors.primary} />
            <HeaderIconButton icon="pencil" onPress={() => navigate(ROUTES.ADD_ENTITY, { editEntityId: entity.id })} accessibilityLabel="Edit entity" color={colors.primary} />
          </View>
        }
      />

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="document-outline" title="No documents found" subtitle="Use the add button above to track a document for this entity." />}
      />
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  headerActions: { flexDirection: 'row', gap: 8 },
  listItem: { borderRadius: 20, marginBottom: 10 },
  listContent: { flexDirection: 'row', alignItems: 'center', padding: 14, minHeight: 72 },
  iconBox: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  itemLeft: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 16, fontWeight: '800' },
  itemDate: { fontSize: 13, fontWeight: '800', marginTop: 4 },
});
