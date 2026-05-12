import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';
import GlassSurface from '../glass/GlassSurface';

export default function StatsRow({ totalEntities, expiringSoonCount, expiredCount }) {
  const { colors } = useTheme();
  const stats = [
    { label: 'Entities', value: totalEntities, icon: 'people', color: colors.primary, fill: colors.primaryLight, bg: colors.primaryLight },
    { label: 'Expiring', value: expiringSoonCount, icon: 'time', color: colors.warning, fill: colors.warningGlass, bg: expiringSoonCount > 0 ? colors.warningGlass : 'transparent' },
    { label: 'Expired', value: expiredCount, icon: 'alert-circle', color: colors.danger, fill: colors.dangerGlass, bg: expiredCount > 0 ? colors.dangerGlass : 'transparent' },
  ];

  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <GlassSurface
          key={stat.label}
          blur={false}
          strong
          style={styles.statCard}
          contentStyle={[styles.statContent, { backgroundColor: stat.bg }]}
        >
          <View style={[styles.iconWell, { backgroundColor: stat.fill }]}>
            <Ionicons name={stat.icon} size={17} color={stat.color} />
          </View>
          <Text style={[styles.statValue, { color: stat.value > 0 ? stat.color : colors.text }]}>{stat.value}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={1}>{stat.label}</Text>
        </GlassSurface>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
  },
  statContent: {
    minHeight: 100,
    padding: 13,
    justifyContent: 'space-between',
    borderRadius: 20,
  },
  iconWell: {
    width: 32,
    height: 32,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
