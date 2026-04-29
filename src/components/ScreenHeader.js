import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppContext';

export default function ScreenHeader({ title, onBack, rightAction, subtitle }) {
  const { colors } = useAppState();
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: colors.background }
    ]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
      <View style={styles.center}>
        {subtitle && <Text style={[styles.subtitle, { color: colors.primary }]}>{subtitle}</Text>}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      </View>
      {rightAction ? rightAction : <View style={{ width: 24 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  center: { flex: 1, alignItems: 'center' },
  subtitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 2 },
  title: { fontSize: 20, fontWeight: '700' },
});