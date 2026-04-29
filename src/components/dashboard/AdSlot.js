import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';

export default function AdSlot() {
  const { colors } = useTheme();

  return (
    <View style={[styles.adSlot, { backgroundColor: colors.adBg, borderColor: colors.adBorder }]}>
      <View style={[styles.iconBg, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="megaphone" size={16} color={colors.primary} />
      </View>
      <Text style={[styles.adText, { color: colors.textMuted }]}>Sponsored • Ad space available</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  adSlot: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    padding: 14, marginBottom: 28, gap: 10,
  },
  iconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  adText: { fontWeight: '600', fontSize: 13, flex: 1 },
});
