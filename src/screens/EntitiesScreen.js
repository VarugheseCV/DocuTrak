import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Animated } from 'react-native';
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
        <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} activeOpacity={0.7} onPress={() => navigate(ROUTES.ENTITY_DETAIL, { id: entity.id })}>
          <StatusDot color={statusColor} />
          <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name={iconName} size={24} color={colors.primary} />
          </View>
          <View style={styles.itemText}>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{entity.name}</Text>
            <Text style={[styles.itemSub, { color: colors.textMuted }]} numberOfLines={1}>
              {typeName} • {summary.totalDocs} doc{summary.totalDocs !== 1 && 's'}
              {(summary.expiring > 0 || summary.expired > 0) ? ' • ' : ''}
              {summary.expiring > 0 ? <Text style={{ color: colors.warning }}>{summary.expiring} expiring</Text> : null}
              {(summary.expiring > 0 && summary.expired > 0) ? ', ' : ''}
              {summary.expired > 0 ? <Text style={{ color: colors.danger }}>{summary.expired} expired</Text> : null}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

export default function EntitiesScreen() {
  const { state, commit, colors } = useAppState();
  const navigate = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  const entities = state.entities.filter(
    e => e.active && e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleDeleteEntity(entityId) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const activeDocs = state.documentRecords.filter(d => d.entityId === entityId && d.status === "Active");
    if (activeDocs.length > 0) {
      Alert.alert("Cannot Delete", `This entity has ${activeDocs.length} active document(s). Please remove them first.`);
      return;
    }
    Alert.alert("Delete Entity", "Are you sure you want to remove this entity?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => commit({ ...state, entities: state.entities.map(e => e.id === entityId ? { ...e, active: false } : e) }),
      },
    ]);
  }

  const renderRightActions = useCallback((entityId) => (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity style={[styles.actionBtnEdit, { backgroundColor: colors.primary }]} onPress={() => navigate(ROUTES.ADD_ENTITY, { editEntityId: entityId })}>
        <Ionicons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtnDelete, { backgroundColor: colors.danger }]} onPress={() => handleDeleteEntity(entityId)}>
        <Ionicons name="trash" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  ), [state, colors]);

  const renderEntity = useCallback(({ item: entity, index }) => (
    <AnimatedEntityCard
      entity={entity}
      index={index}
      colors={colors}
      state={state}
      navigate={navigate}
      renderRightActions={renderRightActions}
    />
  ), [state, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Entities" onBack={() => navigate(ROUTES.DASHBOARD)} />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search entities..." />

      <FlatList
        data={entities}
        keyExtractor={(item) => item.id}
        renderItem={renderEntity}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="folder-open-outline" title="No entities yet." subtitle="Tap the + button to add one." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  title: { fontSize: 28, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 40 },
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1,
  },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemText: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 17, fontWeight: '800' },
  itemSub: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  actionBtnEdit: { justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
  actionBtnDelete: { justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
});
