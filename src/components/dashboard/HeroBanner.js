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
  const title = isCalm ? 'All Clear' : `${totalUrgent} Action Required`;
  const subtitle = nextExpiry
    ? `${nextExpiry.documentType?.name || 'Document'} for ${nextExpiry.entity?.name || 'Entity'} is ${nextExpiry.daysRemaining < 0 ? 'expired' : 'expiring soon'}.`
    : `No documents expiring within ${alertDays} day${alertDays === 1 ? '' : 's'}.`;

  return (
    <GlassSurface strong style={styles.heroBanner} contentStyle={styles.heroContent} accessibilityRole="summary">
      <LinearGradient
        pointerEvents="none"
        colors={[tintColor, isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.34)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={icon} size={180} color={isDark ? 'rgba(255,255,255,0.055)' : 'rgba(61,106,232,0.08)'} style={styles.heroBgIcon} />
      <View style={styles.heroTextContainer}>
        <View style={[styles.iconWell, { backgroundColor: tintColor, borderColor: colors.glassBorder }]}>
          <Ionicons name={icon} size={24} color={accentColor} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    borderRadius: 28,
    marginBottom: 22,
  },
  heroContent: {
    minHeight: 132,
    padding: 20,
    overflow: 'hidden',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -28,
    top: -12,
    transform: [{ rotate: '-10deg' }],
  },
  heroTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    zIndex: 2,
  },
  iconWell: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 7,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
});
