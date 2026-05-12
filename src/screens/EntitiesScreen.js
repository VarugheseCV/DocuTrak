import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import { useAppState, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import { getEntityIcon, getEntitySummary, getEntityStatusColor } from '../domain/entities';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import StatusDot from '../components/StatusDot';
import GlassScreen from '../components/glass/GlassScreen';
import GlassSurface from '../components/glass/GlassSurface';
import ConfirmSheet from '../components/glass/ConfirmSheet';
import { useToast } from '../components/glass/Toast';

function AnimatedEntityCard({ entity, index, colors, state, navigate, renderRightActions }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = Math.min(index * 50, 400);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const typeName = state.entityTypes.find(t => t.id === entity.entityTypeId)?.name || "Entity";
  const iconName = getEntityIcon(typeName);
  const summary = getEntitySummary(entity.id, state);
  const statusColor = getEntityStatusColor(summary, colors);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Swipeable renderRightActions={() => renderRightActions(entity.id)}>
        <TouchableOpacity
          activeOpacity={0.76}
          onPress={() => navigate(ROUTES.ENTITY_DETAIL, { id: entity.id })}
          accessibilityRole="button"
          accessibilityLabel={`${entity.name}, ${summary.totalDocs} documents`}
          accessibilityHint="Opens entity details. Swipe left for edit and delete actions."
        >
          <GlassSurface blur={false} strong style={styles.listItem} contentStyle={styles.listContent}>
            <StatusDot color={statusColor} />
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={iconName} size={24} color={colors.primary} />
            </View>
            <View style={styles.itemText}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{entity.name}</Text>
              <Text style={[styles.itemSub, { color: colors.textMuted }]} numberOfLines={1}>
                {typeName} - {summary.totalDocs} doc{summary.totalDocs !== 1 && 's'}
                {(summary.expiring > 0 || summary.expired > 0) ? ' - ' : ''}
                {summary.expiring > 0 ? <Text style={{ color: colors.warning }}>{summary.expiring} expiring</Text> : null}
                {(summary.expiring > 0 && summary.expired > 0) ? ', ' : ''}
                {summary.expired > 0 ? <Text style={{ color: colors.danger }}>{summary.expired} expired</Text> : null}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </GlassSurface>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

export default function EntitiesScreen() {
  const { state, commit, colors } = useAppState();
  const { showToast } = useToast();
  const navigate = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const entities = state.entities.filter(
    e => e.active && e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleDeleteEntity(entityId) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const activeDocs = state.documentRecords.filter(d => d.entityId === entityId && d.status === "Active");
    if (activeDocs.length > 0) {
      showToast(`Remove ${activeDocs.length} active document${activeDocs.length === 1 ? '' : 's'} first.`, 'error');
      return;
    }
    setPendingDeleteId(entityId);
  }

  async function confirmDeleteEntity() {
    if (!pendingDeleteId) return;
    await commit({ ...state, entities: state.entities.map(e => e.id === pendingDeleteId ? { ...e, active: false } : e) });
    setPendingDeleteId(null);
    showToast('Entity removed');
  }

  const renderRightActions = useCallback((entityId) => (
    <View style={styles.actions}>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigate(ROUTES.ADD_ENTITY, { editEntityId: entityId })} accessibilityRole="button" accessibilityLabel="Edit entity">
        <Ionicons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => handleDeleteEntity(entityId)} accessibilityRole="button" accessibilityLabel="Delete entity">
        <Ionicons name="trash" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  ), [state, colors, pendingDeleteId]);

  const renderEntity = useCallback(({ item: entity, index }) => (
    <AnimatedEntityCard
      entity={entity}
      index={index}
      colors={colors}
      state={state}
      navigate={navigate}
      renderRightActions={renderRightActions}
    />
  ), [state, colors, renderRightActions]);

  return (
    <GlassScreen>
      <ScreenHeader title="Entities" onBack={() => navigate(ROUTES.DASHBOARD)} />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search entities..." />

      <FlatList
        data={entities}
        keyExtractor={(item) => item.id}
        renderItem={renderEntity}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="folder-open-outline" title="No entities yet." subtitle="Tap Add Entity from the dashboard to start." />}
      />

      <ConfirmSheet
        visible={!!pendingDeleteId}
        title="Delete entity?"
        message="This hides the entity from active lists. Documents must be removed before deleting an entity."
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDeleteEntity}
      />
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  listItem: {
    borderRadius: 20,
    marginBottom: 10,
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBox: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  itemText: { flex: 1, marginRight: 10, minWidth: 0 },
  itemName: { fontSize: 16, fontWeight: '800' },
  itemSub: { fontSize: 13, marginTop: 2, fontWeight: '600' },
  actions: { flexDirection: 'row', marginBottom: 10 },
  actionBtn: { justifyContent: 'center', alignItems: 'center', width: 64, borderRadius: 18, marginLeft: 8 },
});
