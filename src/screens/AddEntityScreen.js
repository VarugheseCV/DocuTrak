import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import { createId } from '../domain/documents';
import ScreenHeader from '../components/ScreenHeader';

export default function AddEntityScreen() {
  const { state, commit, colors } = useAppState();
  const navigate = useAppNavigation();
  const params = useScreenParams();

  const editEntityId = params.editEntityId;
  const existingEntity = editEntityId ? state.entities.find(e => e.id === editEntityId) : null;

  const [name, setName] = useState(existingEntity?.name || "");
  const [entityTypeId, setEntityTypeId] = useState(existingEntity?.entityTypeId || "");
  const [newTypeName, setNewTypeName] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);

  async function save() {
    const trimmedName = name.trim();
    if (!trimmedName) { Alert.alert("Incomplete", "Please enter an entity name."); return; }

    let finalTypeId = entityTypeId;
    let updatedTypes = state.entityTypes;

    if (isCreatingType) {
      const trimmedTypeName = newTypeName.trim();
      if (!trimmedTypeName) { Alert.alert("Incomplete", "Please enter the new entity type name."); return; }
      const existingType = state.entityTypes.find(t => t.active && t.name.toLowerCase() === trimmedTypeName.toLowerCase());
      if (existingType) { Alert.alert("Duplicate Type", `"${existingType.name}" already exists. Select it or use a different name.`); return; }
      finalTypeId = createId("entity-type");
      updatedTypes = [...updatedTypes, { id: finalTypeId, name: trimmedTypeName, active: true }];
    } else if (!finalTypeId) {
      Alert.alert("Incomplete", "Please select an entity type or create a new one."); return;
    }

    const duplicateEntity = state.entities.find(e => e.active && e.name.toLowerCase() === trimmedName.toLowerCase() && e.entityTypeId === finalTypeId && e.id !== editEntityId);
    if (duplicateEntity) { Alert.alert("Duplicate Entity", `"${duplicateEntity.name}" already exists under this type.`); return; }

    const updatedEntity = {
      id: editEntityId || createId("entity"), name: trimmedName, entityTypeId: finalTypeId, active: true
    };

    let newEntities = state.entities;
    if (editEntityId) {
      newEntities = newEntities.map(e => e.id === editEntityId ? { ...e, ...updatedEntity } : e);
    } else {
      newEntities = [...newEntities, updatedEntity];
    }

    commit({
      ...state,
      entityTypes: updatedTypes,
      entities: newEntities,
    });
    navigate(ROUTES.ENTITIES);
  }

  const renderChip = (id, name, isSelected, onPress) => {
    if (isSelected) {
      return (
        <TouchableOpacity key={id} onPress={onPress} activeOpacity={0.8} style={styles.chipWrapper}>
          <LinearGradient colors={["#3A5FCD", colors.primary]} style={[styles.chip, { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]} start={{x:0, y:0}} end={{x:1, y:1}}>
            <Text style={[styles.chipText, { color: '#FFF', fontWeight: '700' }]}>{name}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity key={id} onPress={onPress} activeOpacity={0.6} style={styles.chipWrapper}>
        <View style={[styles.chip, { backgroundColor: colors.surface }]}>
          <Text style={[styles.chipText, { color: colors.textMuted }]}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={editEntityId ? "Edit Entity" : "Add Entity"} onBack={() => navigate(ROUTES.ENTITIES)} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Entity Name</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder="e.g. John Doe, Tesla Model 3..." placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />

        <View style={styles.typeHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Entity Type</Text>
          <TouchableOpacity onPress={() => setIsCreatingType(!isCreatingType)}>
            <Text style={[styles.toggleText, { color: colors.primary }]}>{isCreatingType ? "Select Existing" : "+ Create New"}</Text>
          </TouchableOpacity>
        </View>

        {isCreatingType ? (
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder="e.g. Gadget, Pet..." placeholderTextColor={colors.textMuted} value={newTypeName} onChangeText={setNewTypeName} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {state.entityTypes.filter(t => t.active).map(t => renderChip(t.id, t.name, entityTypeId === t.id, () => setEntityTypeId(t.id)))}
          </ScrollView>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.saveButton} onPress={save} activeOpacity={0.8}>
          <LinearGradient colors={["#3A5FCD", colors.primary]} style={styles.saveButtonGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
            <Text style={styles.saveButtonText}>SAVE ENTITY</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 24, letterSpacing: 0.5 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleText: { fontWeight: '700', marginTop: 24, marginBottom: 12, fontSize: 13 },
  pickerRow: { flexDirection: 'row', marginBottom: 8, paddingBottom: 4 },
  chipWrapper: { marginRight: 10, marginBottom: 4 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  chipText: { fontWeight: '600', fontSize: 14 },
  input: { 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 15, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  footer: { 
    padding: 20, 
    paddingBottom: 30,
  },
  saveButton: { 
    borderRadius: 16, 
    overflow: 'hidden',
    shadowColor: "#4F7CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { 
    fontWeight: '800', 
    fontSize: 15, 
    letterSpacing: 1,
    color: '#FFF'
  },
});
