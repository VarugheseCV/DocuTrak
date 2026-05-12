import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/AppContext';

export default function SectionHeader({ title, total }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: colors.textMuted }]}>{title}</Text>
      {total != null && <Text style={[styles.count, { color: colors.textSecondary }]}>{total}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 18,
    marginLeft: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  count: {
    fontSize: 12,
    fontWeight: '800',
  },
});
