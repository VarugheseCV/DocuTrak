import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
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
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
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
      newRecords = newRecords.map(r => r.id === editDocId ? { ...r, ...record } : r);
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
      <ScreenHeader title={editDocId ? "Edit Document" : "Add Document"} onBack={() => navigate(ROUTES.DASHBOARD)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.text }]}>Entity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
          {state.entities.filter(e => e.active).map(e => renderChip(e.id, e.name, entityId === e.id, () => setEntityId(e.id)))}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={[styles.label, { color: colors.text, marginTop: 0 }]}>Document Type</Text>
          <TouchableOpacity onPress={() => setIsCreatingType(!isCreatingType)}>
            <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 8, fontSize: 13 }}>
              {isCreatingType ? "Select Existing" : "+ Create New"}
            </Text>
          </TouchableOpacity>
        </View>

        {isCreatingType ? (
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder="e.g. Visa, Warranty..." placeholderTextColor={colors.textMuted} value={newDocumentTypeName} onChangeText={setNewDocumentTypeName} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {state.documentTypes.filter(d => d.active).map(d => renderChip(d.id, d.name, documentTypeId === d.id, () => setDocumentTypeId(d.id)))}
          </ScrollView>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Expiry Date</Text>
        <TouchableOpacity style={[styles.input, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface }]} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }, !expiryDate && { color: colors.textMuted }]}>{expiryDate || "Select date (YYYY-MM-DD)"}</Text>
        </TouchableOpacity>
        {showDatePicker && <DateTimePicker value={expiryDate ? new Date(expiryDate) : new Date()} mode="date" display="default" onChange={onDateChange} />}

        <Text style={[styles.label, { color: colors.text }]}>Notes (optional)</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, height: 100, textAlignVertical: 'top' }]} multiline placeholder="Add any additional information..." placeholderTextColor={colors.textMuted} value={description} onChangeText={setDescription} />

        <Text style={[styles.label, { color: colors.text }]}>Upload Image</Text>
        <TouchableOpacity style={[styles.imagePicker, { backgroundColor: colors.surface, borderColor: 'rgba(79, 124, 255, 0.3)' }]} onPress={pickImage} activeOpacity={0.7}>
          {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} /> : (
            <>
              <Ionicons name="camera" size={32} color={colors.primary} />
              <Text style={[styles.imagePickerText, { color: colors.primary }]}>Tap to add photo</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>JPG, PNG up to 10MB</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.saveButton} onPress={save} activeOpacity={0.8}>
          <LinearGradient colors={["#3A5FCD", colors.primary]} style={styles.saveButtonGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
            <Text style={styles.saveButtonText}>SAVE DOCUMENT</Text>
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
  dateText: { fontSize: 15, marginLeft: 12, fontWeight: '500' },
  imagePicker: { 
    height: 140, 
    borderWidth: 1.5, 
    borderStyle: 'dashed', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden' 
  },
  imagePickerText: { marginTop: 10, fontWeight: '700', fontSize: 15 },
  previewImage: { width: '100%', height: '100%' },
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
