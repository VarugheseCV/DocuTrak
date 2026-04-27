import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AddEntityScreen({ state, onCommit, onNavigate }) {
  const [name, setName] = useState("");
  const [entityTypeId, setEntityTypeId] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);

  async function save() {
    if (!name.trim()) {
      Alert.alert("Incomplete", "Please enter an entity name.");
      return;
    }

    let finalTypeId = entityTypeId;
    let updatedTypes = state.entityTypes;

    if (isCreatingType) {
      if (!newTypeName.trim()) {
        Alert.alert("Incomplete", "Please enter the new entity type name.");
        return;
      }
      finalTypeId = createId("entity-type");
      updatedTypes = [...updatedTypes, { id: finalTypeId, name: newTypeName.trim(), active: true }];
    } else if (!finalTypeId) {
      Alert.alert("Incomplete", "Please select an entity type or create a new one.");
      return;
    }

    const entity = {
      id: createId("entity"),
      name: name.trim(),
      entityTypeId: finalTypeId,
      active: true
    };

    onCommit({
      ...state,
      entityTypes: updatedTypes,
      entities: [...state.entities, entity]
    });
    onNavigate("entities");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("entities")}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Entity</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Entity Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. John Doe, Tesla Model 3..." 
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.typeHeader}>
          <Text style={styles.label}>Entity Type</Text>
          <TouchableOpacity onPress={() => setIsCreatingType(!isCreatingType)}>
            <Text style={styles.toggleText}>
              {isCreatingType ? "Select Existing" : "+ Create New"}
            </Text>
          </TouchableOpacity>
        </View>

        {isCreatingType ? (
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Gadget, Pet..." 
            placeholderTextColor={colors.textMuted}
            value={newTypeName}
            onChangeText={setNewTypeName}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {state.entityTypes.filter(t => t.active).map(t => (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.chip, entityTypeId === t.id && styles.chipActive]}
                onPress={() => setEntityTypeId(t.id)}
              >
                <Text style={[styles.chipText, entityTypeId === t.id && styles.chipTextActive]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>SAVE ENTITY</Text>
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
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 16 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleText: { color: colors.primary, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  pickerRow: { flexDirection: 'row', marginBottom: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { color: colors.text, fontWeight: '500' },
  chipTextActive: { color: colors.text, fontWeight: 'bold' },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  footer: { padding: 20, paddingBottom: 30 },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: colors.text, fontWeight: '900', fontSize: 16 }
});
