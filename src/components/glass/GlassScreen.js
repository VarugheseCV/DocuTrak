import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/AppContext';

export default function GlassScreen({ children, style }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.backdropTop, colors.background, colors.backdropBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle radial-like blue glow at the top */}
      {isDark && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(91, 138, 255, 0.06)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View pointerEvents="none" style={[styles.tint, { backgroundColor: colors.backdropTint }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
});
