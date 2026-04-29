import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';

export default function StatsRow({ totalEntities, expiringSoonCount, expiredCount }) {
  const { colors } = useTheme();

  return (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statHeader}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{totalEntities}</Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Entities</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statHeader}>
          <Ionicons name="time" size={20} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>{expiringSoonCount}</Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expiring</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statHeader}>
          <Ionicons name="alert-circle" size={20} color={colors.danger} />
          <Text style={[styles.statValue, { color: colors.text }]}>{expiredCount}</Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expired</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 24 
  },
  statCard: { 
    flex: 1, 
    paddingVertical: 14,
    paddingHorizontal: 12, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent', // overridden inline
    // Soft depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    marginBottom: 6 
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '500' },
});
