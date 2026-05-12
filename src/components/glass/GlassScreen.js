import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/AppContext';

export default function GlassScreen({ children, style }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.backdropTop, colors.background, colors.backdropBottom]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
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
