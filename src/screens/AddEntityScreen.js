import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import { createId } from '../domain/documents';
import ScreenHeader from '../components/ScreenHeader';
import GlassScreen from '../components/glass/GlassScreen';
import GlassSurface from '../components/glass/GlassSurface';
import GlassTextInput from '../components/glass/GlassTextInput';
import GlassButton from '../components/glass/GlassButton';
import { useToast } from '../components/glass/Toast';

export default function AddEntityScreen() {
  const { state, commit, colors } = useAppState();
  const { showToast } = useToast();
  const navigate = useAppNavigation();
  const params = useScreenParams();

  const editEntityId = params.editEntityId;
  const existingEntity = editEntityId ? state.entities.find(e => e.id === editEntityId) : null;

  const [name, setName] = useState(existingEntity?.name || "");
  const [entityTypeId, setEntityTypeId] = useState(existingEntity?.entityTypeId || "");
  const [newTypeName, setNewTypeName] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function save() {
    const nextErrors = {};
    const trimmedName = name.trim();
    let finalTypeId = entityTypeId;
    let updatedTypes = state.entityTypes;

    if (!trimmedName) nextErrors.name = "Enter an entity name.";

    if (isCreatingType) {
      const trimmedTypeName = newTypeName.trim();
      if (!trimmedTypeName) {
        nextErrors.entityType = "Enter the new entity type name.";
      } else {
        const existingType = state.entityTypes.find(t => t.active && t.name.toLowerCase() === trimmedTypeName.toLowerCase());
        if (existingType) {
          nextErrors.entityType = `"${existingType.name}" already exists. Select it instead.`;
        } else {
          finalTypeId = createId("entity-type");
          updatedTypes = [...updatedTypes, { id: finalTypeId, name: trimmedTypeName, active: true }];
        }
      }
    } else if (!finalTypeId) {
      nextErrors.entityType = "Select an entity type or create a new one.";
    }

    const duplicateEntity = state.entities.find(e => e.active && e.name.toLowerCase() === trimmedName.toLowerCase() && e.entityTypeId === finalTypeId && e.id !== editEntityId);
    if (duplicateEntity) nextErrors.name = `"${duplicateEntity.name}" already exists under this type.`;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const updatedEntity = {
      id: editEntityId || createId("entity"), name: trimmedName, entityTypeId: finalTypeId, active: true
    };

    let newEntities = state.entities;
    if (editEntityId) {
      newEntities = newEntities.map(e => e.id === editEntityId ? { ...e, ...updatedEntity } : e);
    } else {
      newEntities = [...newEntities, updatedEntity];
    }

    await commit({
      ...state,
      entityTypes: updatedTypes,
      entities: newEntities,
    });
    setSaving(false);
    showToast(editEntityId ? 'Entity updated' : 'Entity saved');
    navigate(ROUTES.ENTITIES);
  }

  const renderChip = (id, chipName, isSelected, onPress) => (
    <TouchableOpacity
      key={id}
      onPress={onPress}
      activeOpacity={0.78}
      style={styles.chipWrapper}
      accessibilityRole="button"
      accessibilityLabel={chipName}
    >
      <GlassSurface
        blur={false}
        strong={isSelected}
        style={styles.chip}
        contentStyle={[
          styles.chipContent,
          isSelected && { backgroundColor: colors.primaryLight },
        ]}
      >
        {isSelected && <Ionicons name="checkmark" size={14} color={colors.primary} />}
        <Text style={[styles.chipText, { color: isSelected ? colors.primary : colors.textMuted }]} numberOfLines={1}>{chipName}</Text>
      </GlassSurface>
    </TouchableOpacity>
  );

  return (
    <GlassScreen>
      <ScreenHeader title={editEntityId ? "Edit Entity" : "Add Entity"} onBack={() => navigate(ROUTES.ENTITIES)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassTextInput
          label="Entity Name"
          icon="person"
          placeholder="John Doe, Tesla Model 3..."
          value={name}
          onChangeText={(value) => { setName(value); setErrors(e => ({ ...e, name: null })); }}
          error={errors.name}
        />

        <View style={styles.typeHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Entity Type</Text>
          <GlassButton
            icon={isCreatingType ? "list" : "add"}
            label={isCreatingType ? "Select" : "Create"}
            variant="primary"
            onPress={() => { setIsCreatingType(!isCreatingType); setErrors(e => ({ ...e, entityType: null })); }}
          />
        </View>

        {isCreatingType ? (
          <GlassTextInput
            icon="folder"
            placeholder="Gadget, Property, Vendor..."
            value={newTypeName}
            onChangeText={(value) => { setNewTypeName(value); setErrors(e => ({ ...e, entityType: null })); }}
            error={errors.entityType}
          />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
              {state.entityTypes.filter(t => t.active).map(t => renderChip(t.id, t.name, entityTypeId === t.id, () => {
                setEntityTypeId(t.id);
                setErrors(e => ({ ...e, entityType: null }));
              }))}
            </ScrollView>
            {!!errors.entityType && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.entityType}</Text>}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          icon={saving ? "hourglass" : "checkmark"}
          label={saving ? "Saving..." : "Save Entity"}
          variant="primary"
          onPress={save}
          disabled={saving}
          contentStyle={styles.saveButtonContent}
        />
      </View>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 120, gap: 22 },
  label: { fontSize: 13, fontWeight: '800' },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerRow: { flexDirection: 'row', marginBottom: 2, paddingBottom: 6 },
  chipWrapper: { marginRight: 10 },
  chip: { borderRadius: 18 },
  chipContent: { minHeight: 46, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7 },
  chipText: { fontWeight: '800', fontSize: 14, maxWidth: 150 },
  errorText: { fontSize: 12, fontWeight: '700', marginLeft: 4, marginTop: 4 },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  saveButtonContent: { minHeight: 56 },
});
