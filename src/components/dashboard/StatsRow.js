import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';

export default function StatsRow({ totalEntities, expiringSoonCount, expiredCount }) {
  const { colors } = useTheme();

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
          <Text style={[styles.statValue, { color: colors.text }]}>{expiringSoonCount}</Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expiring</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statHeader}>
          <Ionicons name="alert-circle" size={22} color={colors.danger} />
          <Text style={[styles.statValue, { color: colors.text }]}>{expiredCount}</Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expired</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 13, fontWeight: '600' },
});
