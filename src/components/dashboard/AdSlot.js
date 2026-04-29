import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';

export default function AdSlot() {
  const { colors } = useTheme();

  return (
    <View style={[styles.adSlot, { backgroundColor: colors.adBg, borderColor: colors.adBorder }]}>
      <Ionicons name="megaphone" size={18} color={colors.accent} />
      <Text style={[styles.adText, { color: colors.accent }]}>Dashboard advertisement slot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  adSlot: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 16,
    padding: 16, marginBottom: 30, gap: 12,
  },
  adText: { fontWeight: '800', fontSize: 12, flex: 1, textTransform: 'uppercase', letterSpacing: 1 },
});
