import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/AppContext';

export default function HeroBanner({ totalUrgent, nextExpiry, alertDays, expiredCount, expiringSoonCount }) {
  const { colors, isDark } = useTheme();

  // "Soft depth minimalism" gradients without borders
  let bannerColors = isDark ? ["#1A2235", colors.primary] : ["#E8F0FE", "#AECBFA"];
  let bannerIcon = "checkmark-circle";
  let bannerIconTint = "#FFFFFF";
  let titleText = "All Clear";
  
  if (expiredCount > 0) {
    bannerColors = isDark ? ["#3A1616", colors.danger] : ["#FFE1E1", "#FF9999"];
    bannerIcon = "alert-circle";
    titleText = `${totalUrgent} Action Required`;
  } else if (expiringSoonCount > 0) {
    bannerColors = isDark ? ["#3A2810", colors.warning] : ["#FFF0E1", "#FFCC99"];
    bannerIcon = "warning";
    titleText = `${totalUrgent} Action Required`;
  }

  return (
    <LinearGradient 
      colors={bannerColors} 
      style={styles.heroBanner} 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={bannerIcon} size={200} color={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} style={styles.heroBgIcon} />
      <View style={styles.heroTextContainer}>
        <View style={styles.heroTopRow}>
          <Ionicons name={bannerIcon} size={22} color={bannerIconTint} />
          <Text style={styles.heroTitle}>
            {titleText}
          </Text>
        </View>
        <Text style={styles.heroSub}>
          {nextExpiry
            ? `${nextExpiry.documentType?.name || 'Document'} for ${nextExpiry.entity?.name || 'Entity'} is ${nextExpiry.daysRemaining < 0 ? 'expired' : 'expiring soon'}.`
            : `No documents expiring within\n${alertDays} day${alertDays === 1 ? '' : 's'}.`}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heroBanner: { 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 24, 
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4, // subtle elevation instead of border
  },
  heroBgIcon: { position: 'absolute', right: -30, top: 0, transform: [{ rotate: '-10deg' }] },
  heroTextContainer: { zIndex: 2 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', marginLeft: 8, color: '#FFFFFF' },
  heroSub: { fontSize: 13, lineHeight: 20, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
});
