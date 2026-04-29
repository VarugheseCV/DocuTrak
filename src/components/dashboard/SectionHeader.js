import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/AppContext';

export default function SectionHeader({ title }) {
  const { colors } = useTheme();

  return <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4,
  },
});
