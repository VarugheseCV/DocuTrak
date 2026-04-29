import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system/legacy";
import { daysUntil } from '../domain/documents';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader from '../components/ScreenHeader';

export default function DocumentDetailScreen() {
  const { state, commit, colors } = useAppState();
  const navigate = useAppNavigation();
  const params = useScreenParams();

  const record = state.documentRecords.find(r => r.id === params.id);
  if (!record) return null;

  const entity = state.entities.find(e => e.id === record.entityId);
  const documentType = state.documentTypes.find(dt => dt.id === record.documentTypeId);

  const daysRem = daysUntil(record.expiryDate);
  const isExpired = daysRem < 0;
  const isExpiringSoon = daysRem >= 0 && daysRem <= (state.profile?.alertDays || 30);

  let statusText = "Active";
  let statusColor = colors.success;
  if (isExpired) { statusText = "Expired"; statusColor = colors.danger; }
  else if (isExpiringSoon) { statusText = "Expiring Soon"; statusColor = colors.warning; }

  const imageMap = useMemo(() => new Map(state.images.map(img => [img.id, img])), [state.images]);
  const images = useMemo(() => (record.imageIds || []).map(id => imageMap.get(id)).filter(Boolean), [record.imageIds, imageMap]);
  const [selectedImage, setSelectedImage] = React.useState(null);

  async function cleanupImages() {
    await Promise.all(images.map(async (img) => {
      try {
        const info = await FileSystem.getInfoAsync(img.uri);
        if (info.exists) await FileSystem.deleteAsync(img.uri, { idempotent: true });
      } catch (_) { /* ignore */ }
    }));
  }

  function deleteRecord() {
    Alert.alert("Delete Document", "Are you sure you want to remove this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await cleanupImages();
          commit({
            ...state,
            documentRecords: state.documentRecords.map(r => r.id === record.id ? { ...r, status: "In-Active" } : r),
            images: state.images.filter(img => !(record.imageIds || []).includes(img.id)),
          });
          navigate(ROUTES.DASHBOARD);
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={documentType?.name} onBack={() => navigate(ROUTES.DASHBOARD)} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.text }]}>{entity?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.text }]}>Expiry: {record.expiryDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="ellipse" size={16} color={statusColor} style={{ marginLeft: 2 }} />
            <Text style={[styles.infoText, { color: statusColor, fontWeight: 'bold', marginLeft: 6 }]}>Status: {statusText}</Text>
          </View>
          {daysRem !== null && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {isExpired ? `Expired ${Math.abs(daysRem)} days ago` : `${daysRem} days remaining`}
              </Text>
            </View>
          )}
        </View>

        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Image Preview</Text>
            {images.map(img => (
              <TouchableOpacity key={img.id} onPress={() => setSelectedImage(img)} accessibilityRole="button" accessibilityLabel="View full image">
                <Image source={{ uri: img.uri }} style={styles.imagePreview} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!!record.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes:</Text>
            <Text style={[styles.notesText, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}>{record.description}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigate(ROUTES.ADD_DOCUMENT, { editDocId: record.id })}>
          <Text style={styles.actionBtnText}>EDIT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={deleteRecord}>
          <Text style={styles.actionBtnText}>DELETE</Text>
        </TouchableOpacity>
      </View>
      {selectedImage && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedImage(null)} accessibilityRole="button" accessibilityLabel="Close full image">
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
            <ScrollView maximumZoomScale={3} minimumZoomScale={1} centerContent contentContainerStyle={styles.modalImageContainer}>
               <Image source={{ uri: selectedImage.uri }} style={styles.fullScreenImage} resizeMode="contain" />
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, marginLeft: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  imagePreview: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#000', marginBottom: 10 },
  notesText: { fontSize: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, justifyContent: 'space-around' },
  actionBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 8 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 40, right: 20, zIndex: 1, padding: 10 },
  modalImageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  fullScreenImage: { width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 },
});
