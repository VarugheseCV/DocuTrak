import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createId } from '../domain/documents';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader from '../components/ScreenHeader';

export default function AddDocumentScreen() {
  const { state, commit, colors } = useAppState();
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

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setExpiryDate(selectedDate.toISOString().split('T')[0]);
  };

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Image access needed", "Allow image access to attach document photos.");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!picked.canceled) setImage(picked.assets[0]);
  }

  async function save() {
    let finalDocumentTypeId = documentTypeId;
    let updatedDocTypes = state.documentTypes;

    if (isCreatingType) {
      const trimmedName = newDocumentTypeName.trim();
      if (!trimmedName) { Alert.alert("Incomplete", "Please enter the new document type name."); return; }
      const existingType = state.documentTypes.find(dt => dt.active && dt.name.toLowerCase() === trimmedName.toLowerCase());
      if (existingType) { Alert.alert("Duplicate Type", `"${existingType.name}" already exists. Select it or use a different name.`); return; }
      finalDocumentTypeId = createId("doc-type");
      updatedDocTypes = [...updatedDocTypes, { id: finalDocumentTypeId, name: trimmedName, active: true }];
    } else if (!finalDocumentTypeId) {
      Alert.alert("Incomplete", "Please select a document type or create a new one."); return;
    }

    if (!entityId || !expiryDate.trim()) { Alert.alert("Incomplete", "Please select an entity and an expiry date."); return; }

    const isDuplicate = state.documentRecords.some(d => d.entityId === entityId && d.documentTypeId === finalDocumentTypeId && d.status === "Active" && d.id !== editDocId);
    if (isDuplicate) { Alert.alert("Duplicate Entry", "This document type already exists for the selected entity."); return; }

    let imageObj = existingImage;
    let newImages = state.images;
    if (image && (!existingImage || image.uri !== existingImage.uri)) {
      const id = createId("image");
      const ext = image.uri.split(".").pop() || "jpg";
      const target = `${FileSystem.documentDirectory}${id}.${ext}`;
      await FileSystem.copyAsync({ from: image.uri, to: target });
      imageObj = { id, uri: target, originalName: image.fileName || `${id}.${ext}` };
      newImages = [...newImages, imageObj];
    } else if (!image) {
      imageObj = null;
    }

    const record = {
      id: editDocId || createId("document-record"), entityId, documentTypeId: finalDocumentTypeId,
      expiryDate: expiryDate.trim(), description: description.trim(),
      imageIds: imageObj ? [imageObj.id] : [], status: "Active",
    };

    let newRecords = state.documentRecords;
    if (editDocId) {
      newRecords = newRecords.map(r => r.id === editDocId ? record : r);
    } else {
      newRecords = [...newRecords, record];
    }

    commit({
      ...state, documentTypes: updatedDocTypes,
      images: newImages,
      documentRecords: newRecords,
    });
    navigate(ROUTES.DASHBOARD);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Add Document" onBack={() => navigate(ROUTES.DASHBOARD)} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Entity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
          {state.entities.filter(e => e.active).map(e => (
            <TouchableOpacity key={e.id} style={[styles.chip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, entityId === e.id && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setEntityId(e.id)}>
              <Text style={[styles.chipText, { color: colors.text }, entityId === e.id && { fontWeight: 'bold' }]}>{e.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.label, { color: colors.text }]}>Document Type</Text>
          <TouchableOpacity onPress={() => setIsCreatingType(!isCreatingType)}>
            <Text style={{ color: colors.primary, fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>
              {isCreatingType ? "Select Existing" : "+ Create New"}
            </Text>
          </TouchableOpacity>
        </View>

        {isCreatingType ? (
          <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} placeholder="e.g. Visa, Warranty..." placeholderTextColor={colors.textMuted} value={newDocumentTypeName} onChangeText={setNewDocumentTypeName} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {state.documentTypes.filter(d => d.active).map(d => (
              <TouchableOpacity key={d.id} style={[styles.chip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, documentTypeId === d.id && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setDocumentTypeId(d.id)}>
                <Text style={[styles.chipText, { color: colors.text }, documentTypeId === d.id && { fontWeight: 'bold' }]}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Expiry Date</Text>
        <TouchableOpacity style={[styles.datePickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }, !expiryDate && { color: colors.textMuted }]}>{expiryDate || "Select Date (YYYY-MM-DD)"}</Text>
        </TouchableOpacity>
        {showDatePicker && <DateTimePicker value={expiryDate ? new Date(expiryDate) : new Date()} mode="date" display="default" onChange={onDateChange} />}

        <Text style={[styles.label, { color: colors.text }]}>Notes (optional)</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, height: 80, textAlignVertical: 'top' }]} multiline placeholder="Add any additional info..." placeholderTextColor={colors.textMuted} value={description} onChangeText={setDescription} />

        <Text style={[styles.label, { color: colors.text }]}>Upload Image</Text>
        <TouchableOpacity style={[styles.imagePicker, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickImage}>
          {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} /> : (
            <>
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.imagePickerText, { color: colors.textMuted }]}>Add Photo</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={save}>
          <Text style={[styles.saveButtonText, { color: '#FFF' }]}>SAVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  pickerRow: { flexDirection: 'row', marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 10 },
  chipText: { fontWeight: '500' },
  datePickerBtn: { borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 16, marginLeft: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  imagePicker: { height: 120, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imagePickerText: { marginTop: 8, fontWeight: '500' },
  previewImage: { width: '100%', height: '100%' },
  footer: { padding: 16, borderTopWidth: 1 },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontWeight: 'bold', fontSize: 16 },
});
