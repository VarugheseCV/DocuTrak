import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { colors } from '../theme/theme';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AddDocumentScreen({ state, onCommit, onNavigate }) {
  const [entityId, setEntityId] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Image access needed", "Allow image access to attach document photos.");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!picked.canceled) {
      setImage(picked.assets[0]);
    }
  }

  async function save() {
    if (!entityId || !documentTypeId || !expiryDate.trim()) {
      Alert.alert("Incomplete", "Please select entity, document type, and expiry date.");
      return;
    }

    let imageObj = null;
    if (image) {
      const id = createId("image");
      const ext = image.uri.split(".").pop() || "jpg";
      const target = `${FileSystem.documentDirectory}${id}.${ext}`;
      await FileSystem.copyAsync({ from: image.uri, to: target });
      imageObj = { id, uri: target, originalName: image.fileName || `${id}.${ext}` };
    }

    const record = {
      id: createId("document-record"),
      entityId,
      documentTypeId,
      expiryDate: expiryDate.trim(),
      description: description.trim(),
      imageIds: imageObj ? [imageObj.id] : [],
      status: "Active"
    };

    onCommit({
      ...state,
      images: imageObj ? [...state.images, imageObj] : state.images,
      documentRecords: [...state.documentRecords, record]
    });
    onNavigate("dashboard");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("dashboard")}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Document</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Entity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
          {state.entities.filter(e => e.active).map(e => (
            <TouchableOpacity 
              key={e.id} 
              style={[styles.chip, entityId === e.id && styles.chipActive]}
              onPress={() => setEntityId(e.id)}
            >
              <Text style={[styles.chipText, entityId === e.id && styles.chipTextActive]}>{e.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Document Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
          {state.documentTypes.filter(d => d.active).map(d => (
            <TouchableOpacity 
              key={d.id} 
              style={[styles.chip, documentTypeId === d.id && styles.chipActive]}
              onPress={() => setDocumentTypeId(d.id)}
            >
              <Text style={[styles.chipText, documentTypeId === d.id && styles.chipTextActive]}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Expiry Date (YYYY-MM-DD)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2026-05-20" 
          value={expiryDate}
          onChangeText={setExpiryDate}
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
          multiline 
          placeholder="Add any additional info..." 
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Upload Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
              <Text style={styles.imagePickerText}>Add Photo</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>SAVE</Text>
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
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 16 },
  pickerRow: { flexDirection: 'row', marginBottom: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { color: colors.text, fontWeight: '500' },
  chipTextActive: { color: colors.surface, fontWeight: 'bold' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  imagePicker: {
    height: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerText: { color: colors.textMuted, marginTop: 8, fontWeight: '500' },
  previewImage: { width: '100%', height: '100%' },
  footer: { padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 }
});
