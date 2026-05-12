import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createId, formatDateInputValue, parseDateInputValue } from '../domain/documents';
import { deleteDocumentImages } from '../services/documentService';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader from '../components/ScreenHeader';
import GlassScreen from '../components/glass/GlassScreen';
import GlassSurface from '../components/glass/GlassSurface';
import GlassTextInput from '../components/glass/GlassTextInput';
import GlassButton from '../components/glass/GlassButton';
import { useToast } from '../components/glass/Toast';

export default function AddDocumentScreen() {
  const { state, commit, colors } = useAppState();
  const { showToast } = useToast();
  const navigate = useAppNavigation();
  const params = useScreenParams();

  const editDocId = params.editDocId;
  const existingDoc = editDocId ? state.documentRecords.find(d => d.id === editDocId) : null;
  const existingImage = existingDoc?.imageIds?.length > 0 ? state.images.find(img => img.id === existingDoc.imageIds[0]) : null;

  const [entityId, setEntityId] = useState(existingDoc?.entityId || params.entityId || "");
  const [documentTypeId, setDocumentTypeId] = useState(existingDoc?.documentTypeId || "");
  const [newDocumentTypeName, setNewDocumentTypeName] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [expiryDate, setExpiryDate] = useState(existingDoc?.expiryDate || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState(existingDoc?.description || "");
  const [image, setImage] = useState(existingImage || null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryDate(formatDateInputValue(selectedDate));
      setErrors(e => ({ ...e, expiryDate: null }));
    }
  };

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Allow image access to attach document photos.', 'error');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!picked.canceled) setImage(picked.assets[0]);
  }

  async function save() {
    const nextErrors = {};
    let finalDocumentTypeId = documentTypeId;
    let updatedDocTypes = state.documentTypes;

    if (!entityId) nextErrors.entityId = "Select the entity this document belongs to.";

    if (isCreatingType) {
      const trimmedName = newDocumentTypeName.trim();
      if (!trimmedName) {
        nextErrors.documentType = "Enter the new document type name.";
      } else {
        const existingType = state.documentTypes.find(dt => dt.active && dt.name.toLowerCase() === trimmedName.toLowerCase());
        if (existingType) {
          nextErrors.documentType = `"${existingType.name}" already exists. Select it instead.`;
        } else {
          finalDocumentTypeId = createId("doc-type");
          updatedDocTypes = [...updatedDocTypes, { id: finalDocumentTypeId, name: trimmedName, active: true }];
        }
      }
    } else if (!finalDocumentTypeId) {
      nextErrors.documentType = "Select a document type or create a new one.";
    }

    if (!expiryDate.trim()) nextErrors.expiryDate = "Select an expiry date.";

    const isDuplicate = state.documentRecords.some(d => d.entityId === entityId && d.documentTypeId === finalDocumentTypeId && d.status === "Active" && d.id !== editDocId);
    if (isDuplicate) nextErrors.documentType = "This document type already exists for the selected entity.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const recordId = editDocId || createId("document-record");
      const previousImageIds = existingDoc?.imageIds || [];
      let imageObj = existingImage ? { ...existingImage, documentRecordId: recordId } : null;
      let newImages = state.images;

      if (image && (!existingImage || image.uri !== existingImage.uri)) {
        const id = createId("image");
        const ext = image.uri.split(".").pop() || "jpg";
        const target = `${FileSystem.documentDirectory}${id}.${ext}`;
        await FileSystem.copyAsync({ from: image.uri, to: target });
        imageObj = { id, uri: target, originalName: image.fileName || `${id}.${ext}`, documentRecordId: recordId };
        newImages = [...state.images.filter(img => !previousImageIds.includes(img.id)), imageObj];
        await deleteDocumentImages(previousImageIds, state.images);
      } else if (!image) {
        imageObj = null;
        newImages = state.images.filter(img => !previousImageIds.includes(img.id));
        await deleteDocumentImages(previousImageIds, state.images);
      } else if (existingImage && !existingImage.documentRecordId) {
        newImages = state.images.map(img => img.id === existingImage.id ? imageObj : img);
      }

      const record = {
        id: recordId,
        entityId,
        documentTypeId: finalDocumentTypeId,
        expiryDate: expiryDate.trim(),
        description: description.trim(),
        imageIds: imageObj ? [imageObj.id] : [],
        status: "Active",
      };

      const newRecords = editDocId
        ? state.documentRecords.map(r => r.id === editDocId ? { ...r, ...record } : r)
        : [...state.documentRecords, record];

      await commit({
        ...state,
        documentTypes: updatedDocTypes,
        images: newImages,
        documentRecords: newRecords,
      });
      showToast(editDocId ? 'Document updated' : 'Document saved');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      showToast(error.message || 'Could not save document', 'error');
    } finally {
      setSaving(false);
    }
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
      <GlassSurface blur={false} strong={isSelected} style={styles.chip} contentStyle={[styles.chipContent, isSelected && { backgroundColor: colors.primaryLight }]}>
        {isSelected && <Ionicons name="checkmark" size={14} color={colors.primary} />}
        <Text style={[styles.chipText, { color: isSelected ? colors.primary : colors.textMuted }]} numberOfLines={1}>{chipName}</Text>
      </GlassSurface>
    </TouchableOpacity>
  );

  return (
    <GlassScreen>
      <ScreenHeader title={editDocId ? "Edit Document" : "Add Document"} onBack={() => navigate(ROUTES.DASHBOARD)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.text }]}>Entity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
          {state.entities.filter(e => e.active).map(e => renderChip(e.id, e.name, entityId === e.id, () => {
            setEntityId(e.id);
            setErrors(err => ({ ...err, entityId: null }));
          }))}
        </ScrollView>
        {!!errors.entityId && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.entityId}</Text>}

        <View style={styles.typeHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Document Type</Text>
          <GlassButton
            icon={isCreatingType ? "list" : "add"}
            label={isCreatingType ? "Select" : "Create"}
            variant="primary"
            onPress={() => { setIsCreatingType(!isCreatingType); setErrors(err => ({ ...err, documentType: null })); }}
          />
        </View>

        {isCreatingType ? (
          <GlassTextInput
            icon="document-text"
            placeholder="Visa, Warranty, Insurance..."
            value={newDocumentTypeName}
            onChangeText={(value) => { setNewDocumentTypeName(value); setErrors(err => ({ ...err, documentType: null })); }}
            error={errors.documentType}
          />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
              {state.documentTypes.filter(d => d.active).map(d => renderChip(d.id, d.name, documentTypeId === d.id, () => {
                setDocumentTypeId(d.id);
                setErrors(err => ({ ...err, documentType: null }));
              }))}
            </ScrollView>
            {!!errors.documentType && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.documentType}</Text>}
          </>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Expiry Date</Text>
        <TouchableOpacity activeOpacity={0.78} onPress={() => setShowDatePicker(true)} accessibilityRole="button" accessibilityLabel="Select expiry date">
          <GlassSurface blur={false} strong style={styles.dateSurface} contentStyle={[styles.dateContent, errors.expiryDate && { borderColor: colors.danger }]}>
            <Ionicons name="calendar" size={20} color={errors.expiryDate ? colors.danger : colors.primary} />
            <Text style={[styles.dateText, { color: expiryDate ? colors.text : colors.textMuted }]}>{expiryDate || "Select date"}</Text>
          </GlassSurface>
        </TouchableOpacity>
        {!!errors.expiryDate && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.expiryDate}</Text>}
        {showDatePicker && <DateTimePicker value={parseDateInputValue(expiryDate)} mode="date" display="default" onChange={onDateChange} />}

        <GlassTextInput
          label="Notes"
          multiline
          placeholder="Add any additional information..."
          value={description}
          onChangeText={setDescription}
          helper="Optional"
        />

        <Text style={[styles.label, { color: colors.text }]}>Document Image</Text>
        <GlassSurface blur={false} strong style={[styles.imageSurface, image && { shadowColor: colors.success, shadowOpacity: 0.18 }]} contentStyle={styles.imageContent}>
          <TouchableOpacity style={styles.imageTapArea} onPress={pickImage} activeOpacity={0.78} accessibilityRole="button" accessibilityLabel={image ? "Change document image" : "Choose document image"}>
            {image ? (
              <>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <View style={styles.imageNameBadge}>
                  <Ionicons name="attach" size={14} color="#FFF" />
                  <Text style={styles.imageNameText} numberOfLines={1}>{image.fileName || 'Image attached'}</Text>
                </View>
              </>
            ) : (
              <View style={styles.imageEmpty}>
                <View style={[styles.cameraWell, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="camera" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.imagePickerText, { color: colors.primary }]}>Tap to add photo</Text>
                <Text style={[styles.imagePickerSub, { color: colors.textMuted }]}>JPG or PNG · Optional</Text>
              </View>
            )}
          </TouchableOpacity>
          {image && (
            <View style={styles.imageActions}>
              <GlassButton icon="swap-horizontal" label="Replace" onPress={pickImage} variant="primary" style={styles.imageAction} accessibilityLabel="Replace attached image" />
              <GlassButton icon="trash" label="Remove" onPress={() => setImage(null)} variant="danger" style={styles.imageAction} accessibilityLabel="Remove attached image" />
            </View>
          )}
        </GlassSurface>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          icon={saving ? null : "checkmark"}
          label={saving ? "Saving..." : "Save Document"}
          variant="primary"
          onPress={save}
          disabled={saving}
          contentStyle={styles.saveButtonContent}
        >
          {saving ? (
            <View style={styles.savingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.savingText, { color: colors.primary }]}>Saving...</Text>
            </View>
          ) : null}
        </GlassButton>
      </View>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 130, gap: 16 },
  label: { fontSize: 13, fontWeight: '800', marginLeft: 4 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  pickerRow: { flexDirection: 'row', marginBottom: 2, paddingBottom: 6 },
  chipWrapper: { marginRight: 10 },
  chip: { borderRadius: 18 },
  chipContent: { minHeight: 46, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7 },
  chipText: { fontWeight: '800', fontSize: 14, maxWidth: 170 },
  errorText: { fontSize: 12, fontWeight: '700', marginLeft: 4, marginTop: -4 },
  dateSurface: { borderRadius: 18 },
  dateContent: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'transparent', borderRadius: 18 },
  dateText: { fontSize: 15, fontWeight: '700' },
  imageSurface: { borderRadius: 22 },
  imageContent: { padding: 12 },
  imageTapArea: { height: 148, borderRadius: 18, overflow: 'hidden' },
  imageEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraWell: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  imagePickerText: { fontWeight: '900', fontSize: 15 },
  imagePickerSub: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  previewImage: { width: '100%', height: '100%', borderRadius: 18 },
  imageNameBadge: { position: 'absolute', left: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, maxWidth: '80%' },
  imageNameText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  imageActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  imageAction: { flex: 1 },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  saveButtonContent: { minHeight: 56 },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  savingText: { fontSize: 14, fontWeight: '900' },
});
