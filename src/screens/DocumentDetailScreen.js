import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { performDocumentDeletion } from '../services/documentService';
import { daysUntil, formatRelativeExpiryDate } from '../domain/documents';
import { useAppState, useAppNavigation, useScreenParams } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import ScreenHeader from '../components/ScreenHeader';
import GlassScreen from '../components/glass/GlassScreen';
import GlassSurface from '../components/glass/GlassSurface';
import GlassButton from '../components/glass/GlassButton';
import ConfirmSheet from '../components/glass/ConfirmSheet';
import ImageViewerModal from '../components/glass/ImageViewerModal';
import { useToast } from '../components/glass/Toast';

export default function DocumentDetailScreen() {
  const { state, commit, colors } = useAppState();
  const { showToast } = useToast();
  const navigate = useAppNavigation();
  const params = useScreenParams();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);

  const record = state.documentRecords.find(r => r.id === params.id);
  if (!record) return null;

  const entity = state.entities.find(e => e.id === record.entityId);
  const documentType = state.documentTypes.find(dt => dt.id === record.documentTypeId);

  const daysRem = daysUntil(record.expiryDate);
  const isExpired = daysRem !== null && daysRem < 0;
  const isExpiringSoon = daysRem !== null && daysRem >= 0 && daysRem <= (state.profile?.alertDays || 30);

  const statusText = isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Active";
  const statusColor = isExpired ? colors.danger : isExpiringSoon ? colors.warning : colors.success;
  const statusFill = isExpired ? colors.dangerGlass : isExpiringSoon ? colors.warningGlass : colors.successGlass;

  const imageMap = useMemo(() => new Map(state.images.map(img => [img.id, img])), [state.images]);
  const images = useMemo(() => (record.imageIds || []).map(id => imageMap.get(id)).filter(Boolean), [record.imageIds, imageMap]);

  async function deleteRecord() {
    const nextState = await performDocumentDeletion(record.id, state);
    await commit(nextState);
    setConfirmDeleteVisible(false);
    showToast('Document removed');
    navigate(ROUTES.DASHBOARD);
  }

  return (
    <GlassScreen>
      <ScreenHeader title={documentType?.name || 'Document'} onBack={() => navigate(ROUTES.DASHBOARD)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassSurface strong style={styles.summaryCard} contentStyle={styles.summaryContent}>
          <View style={[styles.statusBadge, { backgroundColor: statusFill }]}>
            <Ionicons name={isExpired ? "alert-circle" : isExpiringSoon ? "time" : "checkmark-circle"} size={17} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>

          <Text style={[styles.docTitle, { color: colors.text }]}>{documentType?.name || 'Document'}</Text>
          <Text style={[styles.entityName, { color: colors.textMuted }]}>{entity?.name || 'Entity'}</Text>

          <View style={styles.infoGrid}>
            <InfoTile icon="calendar-outline" label="Expiry" value={record.expiryDate} colors={colors} />
            <InfoTile
              icon="hourglass-outline"
              label="Timeline"
              value={daysRem !== null ? formatRelativeExpiryDate(daysRem) : "Unknown"}
              colors={colors}
              valueColor={statusColor}
            />
          </View>
        </GlassSurface>

        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Images</Text>
            {images.map(img => (
              <TouchableOpacity key={img.id} onPress={() => setViewerImage(img)} activeOpacity={0.82} accessibilityRole="imagebutton" accessibilityLabel="Open document image">
                <GlassSurface blur={false} strong style={styles.imageCard} contentStyle={styles.imageCardContent}>
                  <Image source={{ uri: img.uri }} style={styles.imagePreview} resizeMode="cover" />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="expand" size={18} color="#FFF" />
                    <Text style={styles.imageOverlayText}>View</Text>
                  </View>
                </GlassSurface>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!!record.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
            <GlassSurface blur={false} strong style={styles.notesCard} contentStyle={styles.notesContent}>
              <Text style={[styles.notesText, { color: colors.text }]}>{record.description}</Text>
            </GlassSurface>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton icon="pencil" label="Edit" variant="primary" onPress={() => navigate(ROUTES.ADD_DOCUMENT, { editDocId: record.id })} style={styles.footerButton} />
        <GlassButton icon="trash" label="Delete" variant="danger" onPress={() => setConfirmDeleteVisible(true)} style={styles.footerButton} />
      </View>

      <ConfirmSheet
        visible={confirmDeleteVisible}
        title="Delete document?"
        message="This removes the document from active tracking and deletes its attached images from local storage."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDeleteVisible(false)}
        onConfirm={deleteRecord}
      />
      <ImageViewerModal
        visible={!!viewerImage}
        image={viewerImage}
        title={documentType?.name}
        subtitle={entity?.name}
        onClose={() => setViewerImage(null)}
      />
    </GlassScreen>
  );
}

function InfoTile({ icon, label, value, valueColor, colors }) {
  return (
    <View style={[styles.infoTile, { backgroundColor: colors.glassFill }]}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor || colors.text }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 122 },
  summaryCard: { borderRadius: 28, marginBottom: 24 },
  summaryContent: { padding: 20 },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, marginBottom: 16 },
  statusText: { fontSize: 12, fontWeight: '900' },
  docTitle: { fontSize: 26, fontWeight: '900', marginBottom: 6 },
  entityName: { fontSize: 15, fontWeight: '700', marginBottom: 18 },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoTile: { flex: 1, borderRadius: 18, padding: 14, minHeight: 104 },
  infoLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 10 },
  infoValue: { fontSize: 14, fontWeight: '900', lineHeight: 19, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12, marginLeft: 4 },
  imageCard: { borderRadius: 24, marginBottom: 12 },
  imageCardContent: { padding: 10 },
  imagePreview: { width: '100%', height: 260, borderRadius: 18, backgroundColor: '#000' },
  imageOverlay: { position: 'absolute', right: 22, bottom: 22, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  imageOverlayText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  notesCard: { borderRadius: 22 },
  notesContent: { padding: 16 },
  notesText: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 24, flexDirection: 'row', gap: 12 },
  footerButton: { flex: 1 },
});
