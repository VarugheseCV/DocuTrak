import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from './GlassSurface';
import { useTheme } from '../../context/AppContext';

export default function GlassButton({
  icon,
  label,
  onPress,
  variant = 'neutral',
  disabled = false,
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  children,
}) {
  const { colors } = useTheme();
  const tone = getTone(colors, variant);

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      style={[style, disabled && styles.disabled]}
    >
      <GlassSurface
        strong={variant !== 'neutral'}
        blur={false}
        style={[styles.surface, { borderRadius: 18 }]}
        contentStyle={[
          styles.content,
          { backgroundColor: tone.fill },
          contentStyle,
        ]}
      >
        {children || (
          <View style={styles.row}>
            {icon && <Ionicons name={icon} size={20} color={tone.color} />}
            {label && <Text style={[styles.label, { color: tone.color }]}>{label}</Text>}
          </View>
        )}
      </GlassSurface>
    </TouchableOpacity>
  );
}

function getTone(colors, variant) {
  if (variant === 'primary') return { fill: colors.primaryLight, color: colors.primary };
  if (variant === 'danger') return { fill: colors.dangerGlass, color: colors.danger };
  if (variant === 'warning') return { fill: colors.warningGlass, color: colors.warning };
  if (variant === 'success') return { fill: colors.successGlass, color: colors.success };
  return { fill: 'transparent', color: colors.text };
}

const styles = StyleSheet.create({
  surface: {
    minHeight: 44,
  },
  content: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.48,
  },
});
