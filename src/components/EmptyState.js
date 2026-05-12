import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';
import GlassSurface from './glass/GlassSurface';

export default function EmptyState({ icon = "folder-open-outline", title, subtitle }) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 160,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <GlassSurface blur={false} strong style={styles.iconSurface} contentStyle={styles.iconContent}>
        <Ionicons name={icon} size={42} color={colors.primary} />
      </GlassSurface>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 76,
    paddingBottom: 44,
  },
  iconSurface: {
    width: 86,
    height: 86,
    borderRadius: 30,
  },
  iconContent: {
    width: 86,
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    fontWeight: '600',
  },
});
