import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { colors, isDark } = useTheme();
  const tone = getTone(colors, variant, isDark);

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
        {tone.gradient && (
          <LinearGradient
            pointerEvents="none"
            colors={tone.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
          />
        )}
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

function getTone(colors, variant, isDark) {
  if (variant === 'primary') return {
    fill: colors.primaryLight,
    color: colors.primary,
    gradient: isDark
      ? ['rgba(91, 138, 255, 0.18)', 'rgba(91, 138, 255, 0.06)']
      : ['rgba(59, 106, 229, 0.14)', 'rgba(59, 106, 229, 0.04)'],
  };
  if (variant === 'danger') return {
    fill: colors.dangerGlass,
    color: colors.danger,
    gradient: isDark
      ? ['rgba(255, 107, 107, 0.18)', 'rgba(255, 107, 107, 0.06)']
      : ['rgba(220, 38, 38, 0.12)', 'rgba(220, 38, 38, 0.04)'],
  };
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
