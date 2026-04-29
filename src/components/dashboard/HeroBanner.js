import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/AppContext';

export default function HeroBanner({ totalUrgent, nextExpiry, alertDays, expiredCount, expiringSoonCount }) {
  const { colors, isDark } = useTheme();

  // Rich gradient combos with proper light/dark contrast
  let bannerColors = isDark ? ["#1A2235", "#2B4070"] : ["#3D6AE8", "#5B85F5"];
  let bannerIcon = "checkmark-circle";
  let titleText = "All Clear";
  // Banner always uses white text for readability on gradient backgrounds
  const textColor = "#FFFFFF";
  const subTextColor = "rgba(255,255,255,0.8)";
  
  if (expiredCount > 0) {
    bannerColors = isDark ? ["#3A1616", "#6B2020"] : ["#CF222E", "#E85A5A"];
    bannerIcon = "alert-circle";
    titleText = `${totalUrgent} Action Required`;
  } else if (expiringSoonCount > 0) {
    bannerColors = isDark ? ["#3A2810", "#6B4A1A"] : ["#D4850C", "#F5A623"];
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
      <Ionicons name={bannerIcon} size={200} color="rgba(255,255,255,0.07)" style={styles.heroBgIcon} />
      <View style={styles.heroTextContainer}>
        <View style={styles.heroTopRow}>
          <Ionicons name={bannerIcon} size={22} color={textColor} />
          <Text style={[styles.heroTitle, { color: textColor }]}>
            {titleText}
          </Text>
        </View>
        <Text style={[styles.heroSub, { color: subTextColor }]}>
          {nextExpiry
            ? `${nextExpiry.documentType?.name || 'Document'} for ${nextExpiry.entity?.name || 'Entity'} is ${nextExpiry.daysRemaining < 0 ? 'expired' : 'expiring soon'}.`
            : `No documents expiring within ${alertDays} day${alertDays === 1 ? '' : 's'}.`}
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
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroBgIcon: { position: 'absolute', right: -30, top: 0, transform: [{ rotate: '-10deg' }] },
  heroTextContainer: { zIndex: 2 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', marginLeft: 8 },
  heroSub: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
});
