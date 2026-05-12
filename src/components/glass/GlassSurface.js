import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/AppContext';

export default function GlassSurface({
  children,
  style,
  contentStyle,
  intensity = 32,
  strong = false,
  blur = true,
  border = true,
  highlight = true,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
}) {
  const { colors, isDark } = useTheme();
  const radius = StyleSheet.flatten(style)?.borderRadius || 20;

  return (
    <View
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[
        styles.shadow,
        {
          borderRadius: radius,
          shadowColor: colors.glassShadow,
        },
        style,
      ]}
    >
      <View style={[styles.clip, { borderRadius: radius }]}>
        {blur && (
          <BlurView
            intensity={Platform.OS === 'android' ? Math.min(intensity, 22) : intensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          pointerEvents="none"
          style={[
            styles.tint,
            {
              backgroundColor: strong ? colors.glassFillStrong : colors.glassFill,
              borderColor: border ? colors.glassBorder : 'transparent',
              borderRadius: radius,
            },
          ]}
        />
        {highlight && (
          <LinearGradient
            pointerEvents="none"
            colors={[
              isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
              'rgba(255, 255, 255, 0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.highlight, { borderRadius: radius }]}
          />
        )}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
  clip: {
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  content: {
    position: 'relative',
  },
});
