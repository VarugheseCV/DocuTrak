import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, useAppNavigation } from '../../context/AppContext';
import { ROUTES } from '../../navigation/routes';
import GlassSurface from '../glass/GlassSurface';

export default function QuickActions() {
  const { colors } = useTheme();
  const navigate = useAppNavigation();
  const actions = [
    { label: 'Add Doc', icon: 'document-text', color: colors.primary, route: ROUTES.ADD_DOCUMENT },
    { label: 'Add Entity', icon: 'person-add', color: colors.success, route: ROUTES.ADD_ENTITY },
    { label: 'Entities', icon: 'grid', color: colors.primary, route: ROUTES.ENTITIES },
    { label: 'Settings', icon: 'settings', color: colors.textMuted, route: ROUTES.SETTINGS },
  ];

  function handleAction(route) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigate(route);
  }

  return (
    <View style={styles.quickActionsRow}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={styles.quickAction}
          onPress={() => handleAction(action.route)}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <GlassSurface blur={false} strong style={styles.quickActionGlass} contentStyle={styles.quickActionContent}>
            <Ionicons name={action.icon} size={21} color={action.color} />
          </GlassSurface>
          <Text style={[styles.quickActionLabel, { color: colors.text }]} numberOfLines={1}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 10,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  quickActionGlass: {
    width: 58,
    height: 58,
    borderRadius: 20,
    marginBottom: 9,
  },
  quickActionContent: {
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
