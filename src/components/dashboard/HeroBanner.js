import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppState } from '../../context/AppContext';

export default function HeroBanner({ totalUrgent, nextExpiry, alertDays, expiredCount, expiringSoonCount }) {
  const { colors, isDark } = useAppState();

  let bannerColors = isDark ? ["#1A2A42", "#0A1128"] : ["#E1F0FF", "#B3D7FF"];
  let bannerIcon = "shield-checkmark";
  let bannerIconTint = colors.primary;
  if (expiredCount > 0) {
    bannerColors = isDark ? ["#4A1A1A", "#280A0A"] : ["#FFE1E1", "#FFB3B3"];
    bannerIcon = "alert-circle";
    bannerIconTint = colors.danger;
  } else if (expiringSoonCount > 0) {
    bannerColors = isDark ? ["#4A3010", "#281A05"] : ["#FFF0E1", "#FFD7B3"];
    bannerIcon = "warning";
    bannerIconTint = colors.accent;
  }

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
}

const styles = StyleSheet.create({
  heroBanner: { borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden', borderWidth: 1 },
  heroBgIcon: { position: 'absolute', right: -40, top: -20, transform: [{ rotate: '-15deg' }] },
  heroTextContainer: { zIndex: 2 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '900', marginLeft: 10 },
  heroSub: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
