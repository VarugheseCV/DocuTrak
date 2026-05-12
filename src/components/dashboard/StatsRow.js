import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';
import GlassSurface from '../glass/GlassSurface';

export default function StatsRow({ totalEntities, expiringSoonCount, expiredCount }) {
  const { colors } = useTheme();
  const stats = [
    { label: 'Entities', value: totalEntities, icon: 'people', color: colors.primary, fill: colors.primaryLight },
    { label: 'Expiring', value: expiringSoonCount, icon: 'time', color: colors.warning, fill: colors.warningGlass },
    { label: 'Expired', value: expiredCount, icon: 'alert-circle', color: colors.danger, fill: colors.dangerGlass },
  ];

  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <GlassSurface key={stat.label} blur={false} strong style={styles.statCard} contentStyle={styles.statContent}>
          <View style={[styles.iconWell, { backgroundColor: stat.fill }]}>
            <Ionicons name={stat.icon} size={18} color={stat.color} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
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
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
  },
  statContent: {
    minHeight: 96,
    padding: 12,
    justifyContent: 'space-between',
  },
  iconWell: {
    width: 34,
    height: 34,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 23,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
