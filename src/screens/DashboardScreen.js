import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { daysUntil } from '../domain/documents';
import { useAppState, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import EmptyState from '../components/EmptyState';

export default function DashboardScreen() {
  const [showAllExpired, setShowAllExpired] = useState(false);
  const [showAllExpiring, setShowAllExpiring] = useState(false);
  const { state, commit, colors, isDark, toggleTheme } = useAppState();
  const navigate = useAppNavigation();
  const alertDays = Number(state.profile?.alertDays || 30);

  // --- Derived state (memoized for performance) ---
  const { activeRecords, expiringSoon, expired } = useMemo(() => {
    // 1. Build maps for O(1) lookups
    const entityMap = new Map(state.entities.map(e => [e.id, e]));
    const typeMap = new Map(state.documentTypes.map(dt => [dt.id, dt]));

    // 2. Filter and map records using the maps
    const active = state.documentRecords
      .filter(r => r.status === "Active")
      .map(r => ({
        ...r,
        entity: entityMap.get(r.entityId),
        documentType: typeMap.get(r.documentTypeId),
        daysRemaining: daysUntil(r.expiryDate),
      }))
      .filter(r => r.daysRemaining !== null);

    // 3. Compute soon and expired
    const soon = active
      .filter(r => r.daysRemaining >= 0 && r.daysRemaining <= alertDays)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const exp = active
      .filter(r => r.daysRemaining < 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { activeRecords: active, expiringSoon: soon, expired: exp };
  }, [state.documentRecords, state.entities, state.documentTypes, alertDays]);

  const totalEntities = state.entities.filter(e => e.active).length;
  const totalActive = activeRecords.length;
  const totalUrgent = expiringSoon.length + expired.length;
  const nextExpiry = expiringSoon[0] || expired[0];

  // --- Banner state ---
  let bannerColors = isDark ? ["#1A2A42", "#0A1128"] : ["#E1F0FF", "#B3D7FF"];
  let bannerIcon = "shield-checkmark";
  let bannerIconTint = colors.primary;
  if (expired.length > 0) {
    bannerColors = isDark ? ["#4A1A1A", "#280A0A"] : ["#FFE1E1", "#FFB3B3"];
    bannerIcon = "alert-circle";
    bannerIconTint = colors.danger;
  } else if (expiringSoon.length > 0) {
    bannerColors = isDark ? ["#4A3010", "#281A05"] : ["#FFF0E1", "#FFD7B3"];
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
      <TouchableOpacity style={[styles.actionBtnEdit, { backgroundColor: colors.primary }]} onPress={() => navigate(ROUTES.ADD_DOCUMENT, { editDocId: docId })}>
        <Ionicons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtnDelete, { backgroundColor: colors.danger }]} onPress={() => handleDeleteRecord(docId)}>
        <Ionicons name="trash" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  ), [state, colors]);

  const renderDocItem = useCallback(({ item }) => {
    const isExpired = item.daysRemaining < 0;
    const iconBg = isExpired ? colors.dangerLight : colors.warningLight;
    const iconColor = isExpired ? colors.danger : colors.accent;
    const badgeColor = isExpired ? colors.danger : colors.accent;
    const badgeText = isExpired ? "Expired" : `${item.daysRemaining} days left`;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })} style={[styles.listItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
            <Ionicons name="document-text" size={22} color={iconColor} />
          </View>
          <View style={styles.itemLeft}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.documentType?.name || "Document"}</Text>
            <Text style={[styles.itemSub, { color: colors.textMuted }]}>{item.entity?.name || "Entity"}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.itemDate, { color: colors.text }]}>{item.expiryDate}</Text>
            <Text style={[styles.itemBadge, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }, [state, colors]);

  const renderItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'hero':
        return (
          <LinearGradient colors={bannerColors} style={[styles.heroBanner, { borderColor: colors.borderHighlight }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name={bannerIcon} size={180} color={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} style={styles.heroBgIcon} />
            <View style={styles.heroTextContainer}>
              <View style={styles.heroTopRow}>
                <Ionicons name={bannerIcon} size={24} color={bannerIconTint} />
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {totalUrgent > 0 ? `${totalUrgent} Action Required` : "All Clear"}
                </Text>
              </View>
              <Text style={[styles.heroSub, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
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
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statHeader}>
                <Ionicons name="people" size={22} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{totalEntities}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Entities</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statHeader}>
                <Ionicons name="time" size={22} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>{expiringSoon.length}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expiring</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statHeader}>
                <Ionicons name="alert-circle" size={22} color={colors.danger} />
                <Text style={[styles.statValue, { color: colors.text }]}>{expired.length}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expired</Text>
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
              <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>Add Doc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigate(ROUTES.ADD_ENTITY)}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(48, 209, 88, 0.15)' }]}>
                <Ionicons name="person-add" size={22} color={colors.success} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>Add Entity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigate(ROUTES.ENTITIES)}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="grid" size={22} color={colors.accent} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>All Entities</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigate(ROUTES.SETTINGS)}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(142, 142, 147, 0.15)' }]}>
                <Ionicons name="settings" size={22} color={colors.textMuted} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        );

      case 'ad':
        return (
          <View style={[styles.adSlot, { backgroundColor: colors.adBg, borderColor: colors.adBorder }]}>
            <Ionicons name="megaphone" size={18} color={colors.accent} />
            <Text style={[styles.adText, { color: colors.accent }]}>Dashboard advertisement slot</Text>
          </View>
        );

      case 'sectionHeader':
        return <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{item.title}</Text>;

      case 'doc':
        return renderDocItem({ item });

      case 'toggleList':
        return (
          <TouchableOpacity style={styles.toggleListBtn} onPress={item.onPress} accessibilityRole="button">
            <Text style={[styles.toggleListText, { color: colors.primary }]}>{item.title}</Text>
          </TouchableOpacity>
        );

      case 'empty':
        return <EmptyState icon="documents-outline" title="No documents tracked" subtitle="Tap the + button to add your first document." />;

      default:
        return null;
    }
  }, [state, colors, bannerColors, bannerIcon, bannerIconTint, isDark, navigate, alertDays]);

  // --- Construct list sections ---
  const sections = [];
  if (expired.length > 0) {
    sections.push({ type: 'sectionHeader', title: 'Expired Documents', key: 'h-expired' });
    const displayedExpired = showAllExpired ? expired : expired.slice(0, 5);
    displayedExpired.forEach(d => sections.push({ type: 'doc', ...d, key: `doc-${d.id}` }));
    if (expired.length > 5) {
      sections.push({ type: 'toggleList', title: showAllExpired ? 'Show Less' : `Show All (${expired.length})`, onPress: () => setShowAllExpired(!showAllExpired), key: 'toggle-expired' });
    }
  }
  if (expiringSoon.length > 0) {
    sections.push({ type: 'sectionHeader', title: 'Expiring Soon', key: 'h-expiring' });
    const displayedExpiring = showAllExpiring ? expiringSoon : expiringSoon.slice(0, 5);
    displayedExpiring.forEach(d => sections.push({ type: 'doc', ...d, key: `doc-${d.id}` }));
    if (expiringSoon.length > 5) {
      sections.push({ type: 'toggleList', title: showAllExpiring ? 'Show Less' : `Show All (${expiringSoon.length})`, onPress: () => setShowAllExpiring(!showAllExpiring), key: 'toggle-expiring' });
    }
  }
  if (sections.length === 0) {
    sections.push({ type: 'empty', key: 'empty' });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: colors.primary }]}>DOCUTRAK</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={[styles.headerIconBg, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[
          { type: 'hero', key: 'hero' },
          { type: 'stats', key: 'stats' },
          { type: 'quickActions', key: 'quickActions' },
          { type: 'ad', key: 'ad' },
          ...sections
        ]}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 15,
  },
  brand: { fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '900' },
  headerIconBg: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  content: { padding: 20, paddingBottom: 40 },

  // Hero
  heroBanner: { borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden', borderWidth: 1 },
  heroBgIcon: { position: 'absolute', right: -40, top: -20, transform: [{ rotate: '-15deg' }] },
  heroTextContainer: { zIndex: 2 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '900', marginLeft: 10 },
  heroSub: { fontSize: 14, lineHeight: 22, fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 13, fontWeight: '600' },

  // Quick Actions
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 12, fontWeight: '700' },

  // Ad
  adSlot: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 16,
    padding: 16, marginBottom: 30, gap: 12,
  },
  adText: { fontWeight: '800', fontSize: 12, flex: 1, textTransform: 'uppercase', letterSpacing: 1 },

  // Sections
  sectionTitle: {
    fontSize: 13, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4,
  },

  // List items
  listItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20,
    marginBottom: 12, borderWidth: 1,
  },
  itemIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '800' },
  itemSub: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  itemDate: { fontSize: 15, fontWeight: '800' },
  itemBadge: { fontSize: 12, marginTop: 4, fontWeight: '700' },

  // Swipe actions
  actionBtnEdit: { justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
  actionBtnDelete: { justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
  toggleListBtn: { alignItems: 'center', paddingVertical: 12, marginBottom: 16 },
  toggleListText: { fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
});
