import { TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppContext';
import GlassSurface from './glass/GlassSurface';

export default function SearchBar({ value, onChangeText, placeholder = "Search..." }) {
  const { colors } = useAppState();

  return (
    <GlassSurface blur={false} strong style={styles.surface} contentStyle={styles.container}>
      <Ionicons name="search" size={20} color={colors.textMuted} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={placeholder}
      />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  surface: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minHeight: 52,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});
