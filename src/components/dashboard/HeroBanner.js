import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/AppContext';
import GlassSurface from '../glass/GlassSurface';

export default function HeroBanner({ totalUrgent, nextExpiry, alertDays, expiredCount, expiringSoonCount }) {
  const { colors, isDark } = useTheme();
  const hasExpired = expiredCount > 0;
  const hasExpiring = expiringSoonCount > 0;
  const isCalm = !hasExpired && !hasExpiring;

  const icon = hasExpired ? 'alert-circle' : hasExpiring ? 'time' : 'shield-checkmark';
  const accentColor = hasExpired ? colors.danger : hasExpiring ? colors.warning : colors.success;
  const tintColor = hasExpired ? colors.dangerGlass : hasExpiring ? colors.warningGlass : colors.successGlass;

  // Gradient endpoints based on urgency
  const gradientEnd = isDark
    ? 'rgba(0,0,0,0.15)'
    : (hasExpired ? 'rgba(255,200,200,0.1)' : hasExpiring ? 'rgba(255,230,180,0.1)' : 'rgba(200,255,220,0.1)');

  const title = isCalm ? 'All Clear' : `${totalUrgent} Action Required`;
  const subtitle = nextExpiry
    ? `${nextExpiry.documentType?.name || 'Document'} for ${nextExpiry.entity?.name || 'Entity'} is ${nextExpiry.daysRemaining < 0 ? 'expired' : 'expiring soon'}.`
    : `No documents expiring within ${alertDays} day${alertDays === 1 ? '' : 's'}.`;

  return (
    <GlassSurface strong style={styles.heroBanner} contentStyle={styles.heroContent} accessibilityRole="summary">
      <LinearGradient
        pointerEvents="none"
        colors={[tintColor, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={icon} size={160} color={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} style={styles.heroBgIcon} />

      <View style={styles.heroTextContainer}>
        <View style={[styles.iconWell, { backgroundColor: tintColor, borderColor: accentColor + '33' }]}>
          <Ionicons name={icon} size={26} color={accentColor} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: colors.text }]} numberOfLines={2}>{title}</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]} numberOfLines={3}>{subtitle}</Text>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    borderRadius: 26,
    marginBottom: 20,
  },
  heroContent: {
    minHeight: 124,
    padding: 20,
    overflow: 'hidden',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -22,
    top: -10,
    transform: [{ rotate: '-12deg' }],
  },
  heroTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },
  iconWell: {
    width: 52,
    height: 52,
    borderRadius: 17,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
