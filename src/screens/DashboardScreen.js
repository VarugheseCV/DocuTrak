import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors } from '../theme/theme';
import { daysUntil } from '../domain/documents';
import { useAppState, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';

export default function DashboardScreen() {
  const { state, commit } = useAppState();
  const navigate = useAppNavigation();
  const alertDays = Number(state.profile?.alertDays || 30);

  // --- Derived state (computed once per render) ---
  const activeRecords = state.documentRecords
    .filter(r => r.status === "Active")
    .map(r => ({
      ...r,
      entity: state.entities.find(e => e.id === r.entityId),
      documentType: state.documentTypes.find(dt => dt.id === r.documentTypeId),
      daysRemaining: daysUntil(r.expiryDate),
    }))
    .filter(r => r.daysRemaining !== null);

  const expiringSoon = activeRecords
    .filter(r => r.daysRemaining >= 0 && r.daysRemaining <= alertDays)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const expired = activeRecords
    .filter(r => r.daysRemaining < 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const totalEntities = state.entities.filter(e => e.active).length;
  const totalActive = activeRecords.length;
  const totalUrgent = expiringSoon.length + expired.length;
  const nextExpiry = expiringSoon[0] || expired[0];

  // --- Banner state ---
  let bannerColors = ["#1A2A42", "#0A1128"];
  let bannerIcon = "shield-checkmark";
  let bannerIconTint = colors.primary;
  if (expired.length > 0) {
    bannerColors = ["#4A1A1A", "#280A0A"];
    bannerIcon = "alert-circle";
    bannerIconTint = colors.danger;
  } else if (expiringSoon.length > 0) {
    bannerColors = ["#4A3010", "#281A05"];
    bannerIcon = "warning";
    bannerIconTint = colors.accent;
  }

  // --- Handlers ---
  function handleDeleteRecord(recordId) {
    Alert.alert("Delete Document", "Are you sure you want to remove this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => commit({
          ...state,
          documentRecords: state.documentRecords.map(r => r.id === recordId ? { ...r, status: "In-Active" } : r),
        }),
      },
    ]);
  }

  // --- Render helpers ---
  const renderRightActions = useCallback((docId) => (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity
        style={styles.actionBtnEdit}
        onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: docId })}
        accessibilityRole="button"
        accessibilityLabel="Edit document"
      >
        <Ionicons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtnDelete}
        onPress={() => handleDeleteRecord(docId)}
        accessibilityRole="button"
        accessibilityLabel="Delete document"
      >
        <Ionicons name="trash" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  ), [state]);

  const renderDocItem = useCallback(({ item }) => {
    const isExpired = item.daysRemaining < 0;
    const iconBg = isExpired ? colors.dangerLight : colors.warningLight;
    const iconColor = isExpired ? colors.danger : colors.accent;
    const badgeColor = isExpired ? colors.danger : colors.accent;
    const badgeText = isExpired ? "Expired" : `${item.daysRemaining} days left`;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })} style={styles.listItem}>
          <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
            <Ionicons name="document-text" size={22} color={iconColor} />
          </View>
          <View style={styles.itemLeft}>
            <Text style={styles.itemName}>{item.documentType?.name || "Document"}</Text>
            <Text style={styles.itemSub}>{item.entity?.name || "Entity"}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.itemDate}>{item.expiryDate}</Text>
            <Text style={[styles.itemBadge, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }, [state]);

  // --- Build FlatList sections data ---
  const sections = [];

  // Hero banner (always first)
  sections.push({ type: 'hero', key: 'hero' });

  // Stats row
  sections.push({ type: 'stats', key: 'stats' });

  // Quick actions
  sections.push({ type: 'quickActions', key: 'quickActions' });

  // Ad slot
  sections.push({ type: 'ad', key: 'ad' });

  // Expiring soon section
  if (expiringSoon.length > 0) {
    sections.push({ type: 'sectionHeader', key: 'expiring-header', title: 'Expiring Soon' });
    expiringSoon.forEach(item => sections.push({ type: 'doc', key: item.id, ...item }));
  }

  // Expired section
  if (expired.length > 0) {
    sections.push({ type: 'sectionHeader', key: 'expired-header', title: 'Expired' });
    expired.forEach(item => sections.push({ type: 'doc', key: item.id, ...item }));
  }

  // Empty state
  if (totalActive === 0) {
    sections.push({ type: 'empty', key: 'empty' });
  }

  const renderItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'hero':
        return (
          <LinearGradient colors={bannerColors} style={styles.heroBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name={bannerIcon} size={180} color="rgba(255,255,255,0.03)" style={styles.heroBgIcon} />
            <View style={styles.heroTextContainer}>
              <View style={styles.heroTopRow}>
                <Ionicons name={bannerIcon} size={24} color={bannerIconTint} />
                <Text style={styles.heroTitle}>
                  {totalUrgent > 0 ? `${totalUrgent} Action Required` : "All Clear"}
                </Text>
              </View>
              <Text style={styles.heroSub}>
                {nextExpiry
                  ? `${nextExpiry.documentType?.name || 'Document'} for ${nextExpiry.entity?.name || 'Entity'} is ${nextExpiry.daysRemaining < 0 ? 'expired' : 'expiring soon'}.`
                  : `No documents expiring within ${alertDays} days.`}
              </Text>
            </View>
          </LinearGradient>
        );

      case 'stats':
        return (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="people" size={22} color={colors.primary} />
                <Text style={styles.statValue}>{totalEntities}</Text>
              </View>
              <Text style={styles.statLabel}>Entities</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="time" size={22} color={colors.accent} />
                <Text style={styles.statValue}>{expiringSoon.length}</Text>
              </View>
              <Text style={styles.statLabel}>Expiring</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="alert-circle" size={22} color={colors.danger} />
                <Text style={styles.statValue}>{expired.length}</Text>
              </View>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>
        );

      case 'quickActions':
        return (
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigate(ROUTES.ADD_DOCUMENT)}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="document-attach" size={22} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Add Doc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigate(ROUTES.ADD_ENTITY)}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(48, 209, 88, 0.15)' }]}>
                <Ionicons name="person-add" size={22} color={colors.success} />
              </View>
              <Text style={styles.quickActionLabel}>Add Entity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigate(ROUTES.ENTITIES)}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="grid" size={22} color={colors.accent} />
              </View>
              <Text style={styles.quickActionLabel}>All Entities</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigate(ROUTES.SETTINGS)}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(142, 142, 147, 0.15)' }]}>
                <Ionicons name="settings" size={22} color={colors.textMuted} />
              </View>
              <Text style={styles.quickActionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        );

      case 'ad':
        return (
          <View style={styles.adSlot}>
            <Ionicons name="megaphone" size={18} color={colors.accent} />
            <Text style={styles.adText}>Dashboard advertisement slot</Text>
          </View>
        );

      case 'sectionHeader':
        return <Text style={styles.sectionTitle}>{item.title}</Text>;

      case 'doc':
        return renderDocItem({ item });

      case 'empty':
        return <EmptyState icon="documents-outline" title="No documents tracked" subtitle="Tap the + button to add your first document." />;

      default:
        return null;
    }
  }, [state, bannerColors, bannerIcon, bannerIconTint]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>DOCUTRAK</Text>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigate(ROUTES.SETTINGS)}
          style={styles.headerIconBg}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <FAB label="Add Document" onPress={() => navigate(ROUTES.ADD_DOCUMENT)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 15,
  },
  brand: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: colors.text },
  headerIconBg: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  content: { padding: 20, paddingBottom: 120 },

  // Hero
  heroBanner: { borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderHighlight },
  heroBgIcon: { position: 'absolute', right: -40, top: -20, transform: [{ rotate: '-15deg' }] },
  heroTextContainer: { zIndex: 2 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginLeft: 10 },
  heroSub: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },

  // Quick Actions
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },

  // Ad
  adSlot: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.adBg,
    borderWidth: 1, borderColor: colors.adBorder, borderStyle: 'dashed', borderRadius: 16,
    padding: 16, marginBottom: 30, gap: 12,
  },
  adText: { color: colors.accent, fontWeight: '800', fontSize: 12, flex: 1, textTransform: 'uppercase', letterSpacing: 1 },

  // Sections
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4,
  },

  // List items
  listItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20,
    marginBottom: 12, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
  },
  itemIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '800', color: colors.text },
  itemSub: { fontSize: 14, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
  itemDate: { fontSize: 15, fontWeight: '800', color: colors.text },
  itemBadge: { fontSize: 12, marginTop: 4, fontWeight: '700' },

  // Swipe actions
  actionBtnEdit: { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
  actionBtnDelete: { backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
});
