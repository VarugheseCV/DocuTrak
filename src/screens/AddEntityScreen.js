import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={editEntityId ? "Edit Entity" : "Add Entity"} onBack={() => navigate(ROUTES.ENTITIES)} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Entity Name</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]} placeholder="e.g. John Doe, Tesla Model 3..." placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />

        <View style={styles.typeHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Entity Type</Text>
          <TouchableOpacity onPress={() => setIsCreatingType(!isCreatingType)}>
            <Text style={[styles.toggleText, { color: colors.primary }]}>{isCreatingType ? "Select Existing" : "+ Create New"}</Text>
          </TouchableOpacity>
        </View>

        {isCreatingType ? (
          <TextInput style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]} placeholder="e.g. Gadget, Pet..." placeholderTextColor={colors.textMuted} value={newTypeName} onChangeText={setNewTypeName} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {state.entityTypes.filter(t => t.active).map(t => (
              <TouchableOpacity key={t.id} style={[styles.chip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, entityTypeId === t.id && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setEntityTypeId(t.id)}>
                <Text style={[styles.chipText, { color: colors.text }, entityTypeId === t.id && { fontWeight: 'bold' }]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={save}>
          <Text style={[styles.saveButtonText, { color: '#FFF' }]}>SAVE ENTITY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleText: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  pickerRow: { flexDirection: 'row', marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 10 },
  chipText: { fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16 },
  footer: { padding: 20, paddingBottom: 30 },
  saveButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { fontWeight: '900', fontSize: 16 },
});
