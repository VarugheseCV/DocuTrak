import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system/legacy";
import { colors } from '../theme/theme';
import { daysUntil } from '../domain/documents';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader from '../components/ScreenHeader';

export default function DocumentDetailScreen() {
  const { state, commit } = useAppState();
  const navigate = useAppNavigation();
  const params = useScreenParams();

  const record = state.documentRecords.find(r => r.id === params.id);
  if (!record) return null;

  const entity = state.entities.find(e => e.id === record.entityId);
  const documentType = state.documentTypes.find(dt => dt.id === record.documentTypeId);

  const daysRem = daysUntil(record.expiryDate);
  const isExpired = daysRem !== null && daysRem < 0;
  const isExpiringSoon = daysRem !== null && daysRem >= 0 && daysRem <= (state.profile?.alertDays || 30);

  let statusText = "Active";
  let statusColor = colors.success;
  if (isExpired) { statusText = "Expired"; statusColor = colors.danger; }
  else if (isExpiringSoon) { statusText = "Expiring Soon"; statusColor = colors.warning; }

  const images = (record.imageIds || [])
    .map(id => state.images.find(img => img.id === id))
    .filter(Boolean)
    .map(img => ({
      ...img,
      uri: `${FileSystem.documentDirectory}${img.filename || img.uri.split('/').pop()}`
    }));

  function deleteRecord() {
    Alert.alert("Delete Document", "Are you sure you want to remove this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => {
          commit({
            ...state,
            documentRecords: state.documentRecords.map(r => r.id === record.id ? { ...r, status: "In-Active" } : r),
          });
          navigate(ROUTES.DASHBOARD);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={documentType?.name} onBack={() => navigate(ROUTES.DASHBOARD)} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>{entity?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>Expiry: {record.expiryDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="ellipse" size={16} color={statusColor} style={{ marginLeft: 2 }} />
            <Text style={[styles.infoText, { color: statusColor, fontWeight: 'bold', marginLeft: 6 }]}>Status: {statusText}</Text>
          </View>
          {daysRem !== null && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.textMuted} />
              <Text style={styles.infoText}>
                {isExpired ? `Expired ${Math.abs(daysRem)} days ago` : `${daysRem} days remaining`}
              </Text>
            </View>
          )}
        </View>

        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image Preview</Text>
            {images.map(img => (
              <Image key={img.id} source={{ uri: img.uri }} style={styles.imagePreview} resizeMode="contain" />
            ))}
          </View>
        )}

        {!!record.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.notesText}>{record.description}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={deleteRecord}>
          <Text style={styles.actionBtnText}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, color: colors.text, marginLeft: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  imagePreview: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#000', marginBottom: 10 },
  notesText: { fontSize: 16, color: colors.text, backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  footer: { flexDirection: 'row', padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, justifyContent: 'space-around' },
  actionBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 8 },
  actionBtnText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
});
