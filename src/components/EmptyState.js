import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';

export default function EmptyState({ icon = "folder-open-outline", title, subtitle }) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400).delay(200)} style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.borderHighlight} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});
