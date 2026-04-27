import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors } from '../theme/theme';
import { daysUntil } from '../domain/documents';

export default function DashboardScreen({ state, onNavigate }) {
  const alertDays = Number(state.profile?.alertDays || 30);
  
  const activeRecords = state.documentRecords
    .filter(record => record.status === "Active")
    .map(record => ({
      ...record,
      entity: state.entities.find(e => e.id === record.entityId),
      documentType: state.documentTypes.find(dt => dt.id === record.documentTypeId),
      daysRemaining: daysUntil(record.expiryDate)
    }))
    .filter(r => r.daysRemaining !== null);

  const expiringSoon = activeRecords
    .filter(r => r.daysRemaining >= 0 && r.daysRemaining <= alertDays)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const expired = activeRecords
    .filter(r => r.daysRemaining < 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const totalUrgent = expiringSoon.length + expired.length;
  const nextExpiry = expiringSoon[0] || expired[0];

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

  const renderRightActions = (docId) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.actionBtnEdit}>
          <Ionicons name="pencil" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDelete}>
          <Ionicons name="trash" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>DOCUTRAK</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate("settings")} style={styles.headerIconBg}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* PREMIUM HERO BANNER */}
        <LinearGradient colors={bannerColors} style={styles.heroBanner} start={{x:0,y:0}} end={{x:1,y:1}}>
          <Ionicons 
            name={bannerIcon} 
            size={180} 
            color="rgba(255,255,255,0.03)" 
            style={{ position: 'absolute', right: -40, top: -20, transform: [{ rotate: '-15deg' }] }} 
          />
          <View style={styles.heroTextContainer}>
            <View style={styles.heroTopRow}>
              <Ionicons name={bannerIcon} size={24} color={bannerIconTint} />
              <Text style={styles.heroTitle}>
                {totalUrgent > 0 ? `${totalUrgent} Action Required` : "All Safe"}
              </Text>
            </View>
            <Text style={styles.heroSub}>
              {nextExpiry 
                ? `${nextExpiry.documentType?.name || 'Document'} for ${nextExpiry.entity?.name || 'Entity'} is ${nextExpiry.daysRemaining < 0 ? 'expired' : 'expiring soon'}.` 
                : `No active documents are expiring within ${alertDays} days.`}
            </Text>
          </View>
        </LinearGradient>

        {/* PREMIUM STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="time" size={24} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>{expiringSoon.length}</Text>
            </View>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="alert-circle" size={24} color={colors.danger} />
              <Text style={[styles.statValue, { color: colors.text }]}>{expired.length}</Text>
            </View>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        {/* PREMIUM AD BANNER */}
        <View style={styles.adSlot}>
          <Ionicons name="megaphone" size={18} color={colors.accent} />
          <Text style={styles.adText}>Dashboard advertisement slot</Text>
        </View>

        {expiringSoon.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expiring Soon</Text>
            {expiringSoon.map(item => (
              <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)}>
                <TouchableOpacity onPress={() => onNavigate("documentDetail", { id: item.id })} style={styles.listItem}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.warningLight }]}>
                    <Ionicons name="document-text" size={22} color={colors.accent} />
                  </View>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.documentType?.name || "Document"}</Text>
                    <Text style={styles.itemSub}>{item.entity?.name || "Entity"}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.itemDate, { color: colors.text }]}>{item.expiryDate}</Text>
                    <Text style={{ fontSize: 12, color: colors.accent, marginTop: 4, fontWeight: '700' }}>{item.daysRemaining} days left</Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        )}

        {expired.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expired</Text>
            {expired.map(item => (
              <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)}>
                <TouchableOpacity onPress={() => onNavigate("documentDetail", { id: item.id })} style={styles.listItem}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.dangerLight }]}>
                    <Ionicons name="document-text" size={22} color={colors.danger} />
                  </View>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.documentType?.name || "Document"}</Text>
                    <Text style={styles.itemSub}>{item.entity?.name || "Entity"}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.itemDate, { color: colors.text }]}>{item.expiryDate}</Text>
                    <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4, fontWeight: '700' }}>Expired</Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        )}
        {/* EMPTY STATE */}
        {expiringSoon.length === 0 && expired.length === 0 && activeRecords.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 60 }}>
            <Ionicons name="documents-outline" size={64} color={colors.borderHighlight} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>No documents tracked</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>Tap the + button to add your first document.</Text>
          </View>
        )}

      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8} onPress={() => onNavigate("addDocument")}>
          <LinearGradient colors={[colors.primary, "#0051a8"]} style={styles.fab} start={{x:0, y:0}} end={{x:1, y:1}}>
            <Ionicons name="add" size={24} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15, marginLeft: 8 }}>Add Document</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  heroTextContainer: {
    zIndex: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginLeft: 10,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  adSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.adBg,
    borderWidth: 1,
    borderColor: colors.adBorder,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    gap: 12,
  },
  adText: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 12,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  itemSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '800',
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabContainer: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionBtnEdit: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  actionBtnDelete: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: 12,
    borderRadius: 20,
    marginLeft: 10,
  }
});
