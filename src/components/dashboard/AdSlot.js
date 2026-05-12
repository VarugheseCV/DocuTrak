import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/AppContext';
import GlassSurface from '../glass/GlassSurface';

export default function AdSlot() {
  const { colors } = useTheme();

  return (
    <GlassSurface blur={false} style={styles.adSlot} contentStyle={styles.content}>
      <View style={[styles.iconBg, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="megaphone" size={16} color={colors.primary} />
      </View>
      <Text style={[styles.adText, { color: colors.textMuted }]}>Sponsored - Ad space available</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  adSlot: {
    borderRadius: 18,
    marginBottom: 28,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adText: {
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
});
