import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors } from '../theme/theme';
import { daysUntil } from '../domain/documents';
import { useAppState, useAppNavigation } from '../context/AppContext';

const getEntityIcon = (typeName) => {
  if (!typeName) return "cube";
  const t = typeName.toLowerCase();
  if (t.includes('individual') || t.includes('person')) return "person";
  if (t.includes('vehicle') || t.includes('car')) return "car";
  if (t.includes('property') || t.includes('land') || t.includes('flat') || t.includes('building') || t.includes('house')) return "business";
  if (t.includes('company') || t.includes('business')) return "briefcase";
  return "folder";
};

export default function EntitiesScreen() {
  const { state, commit } = useAppState();
  const navigate = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const entities = state.entities.filter(e => e.active && e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const alertDays = Number(state.profile?.alertDays || 30);

  function handleDeleteEntity(entityId) {
    const activeDocs = state.documentRecords.filter(d => d.entityId === entityId && d.status === "Active");
    if (activeDocs.length > 0) {
      Alert.alert(
        "Cannot Delete",
        `This entity has ${activeDocs.length} active document(s). Please remove them first.`
      );
      return;
    }
    Alert.alert("Delete Entity", "Are you sure you want to remove this entity?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          commit({
            ...state,
            entities: state.entities.map(e =>
              e.id === entityId ? { ...e, active: false } : e
            )
          });
        }
      }
    ]);
  }

  const renderRightActions = (entityId) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.actionBtnEdit} onPress={() => navigate("entityDetail", { id: entityId })}>
          <Ionicons name="pencil" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDelete} onPress={() => handleDeleteEntity(entityId)}>
          <Ionicons name="trash" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Entities</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entities..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {entities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={colors.borderHighlight} />
            <Text style={styles.emptyText}>No entities yet.</Text>
            <Text style={styles.emptySub}>Tap the + button to add one.</Text>
          </View>
        ) : (
          entities.map(entity => {
            const typeName = state.entityTypes.find(t => t.id === entity.entityTypeId)?.name || "Entity";
            const iconName = getEntityIcon(typeName);
            
            const entityDocs = state.documentRecords.filter(d => d.entityId === entity.id && d.status === "Active");
            let expiring = 0;
            let expired = 0;

            entityDocs.forEach(doc => {
              const diffDays = daysUntil(doc.expiryDate);
              if (diffDays !== null) {
                if (diffDays < 0) expired++;
                else if (diffDays <= alertDays) expiring++;
              }
            });

            const totalDocs = entityDocs.length;
            let statusDot = colors.success;
            if (expired > 0) statusDot = colors.danger;
            else if (expiring > 0) statusDot = colors.warning;
            else if (totalDocs === 0) statusDot = colors.textMuted;

            return (
              <Swipeable key={entity.id} renderRightActions={() => renderRightActions(entity.id)}>
                <TouchableOpacity 
                  style={styles.listItem} 
                  activeOpacity={0.7}
                  onPress={() => navigate("entityDetail", { id: entity.id })}
                >
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: statusDot }]} />
                  </View>
                  
                  <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name={iconName} size={24} color={colors.primary} />
                  </View>
                  
                  <View style={styles.itemText}>
                    <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{entity.name}</Text>
                    <Text style={styles.itemSub} numberOfLines={1} ellipsizeMode="tail">
                      {typeName} • {totalDocs} doc{totalDocs !== 1 && 's'}
                      {(expiring > 0 || expired > 0) ? ` • ` : ''}
                      {expiring > 0 ? <Text style={{color: colors.warning}}>{expiring} expiring</Text> : null}
                      {(expiring > 0 && expired > 0) ? ', ' : ''}
                      {expired > 0 ? <Text style={{color: colors.danger}}>{expired} expired</Text> : null}
                    </Text>
                  </View>
                  
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </Swipeable>
            );
          })
        )}
      </ScrollView>

      {/* FAB with Label */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8} onPress={() => navigate("addEntity")}>
          <LinearGradient colors={[colors.primary, "#0051a8"]} style={styles.fab} start={{x:0, y:0}} end={{x:1, y:1}}>
            <Ionicons name="add" size={24} color={colors.text} />
            <Text style={styles.fabLabel}>Add Entity</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  content: { padding: 20, paddingBottom: 120 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusIndicator: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemText: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 17, fontWeight: '800', color: colors.text },
  itemSub: { fontSize: 13, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
  fabWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabContainer: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  fabLabel: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  actionBtnEdit: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  actionBtnDelete: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: 12,
    borderRadius: 20,
    marginLeft: 10,
  }
});
