import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppContext';
import GlassButton from './glass/GlassButton';

export default function ScreenHeader({ title, onBack, rightAction, subtitle }) {
  const { colors } = useAppState();

  return (
    <View style={styles.container}>
      {onBack ? (
        <GlassButton
          icon="arrow-back"
          onPress={onBack}
          accessibilityLabel="Go back"
          style={styles.sideButton}
          contentStyle={styles.iconButton}
        />
      ) : (
        <View style={styles.sideButton} />
      )}
      <View style={styles.center}>
        {subtitle && <Text style={[styles.subtitle, { color: colors.primary }]}>{subtitle}</Text>}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      </View>
      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : (
        <View style={styles.sideButton} />
      )}
    </View>
  );
}

export function HeaderIconButton({ icon, onPress, accessibilityLabel, color }) {
  const { colors } = useAppState();
  return (
    <GlassButton
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={styles.sideButton}
      contentStyle={styles.iconButton}
    >
      <Ionicons name={icon} size={22} color={color || colors.text} />
    </GlassButton>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  sideButton: {
    width: 44,
    height: 44,
  },
  iconButton: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  rightAction: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
});
