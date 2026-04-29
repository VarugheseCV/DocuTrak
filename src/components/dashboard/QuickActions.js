import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, useAppNavigation } from '../../context/AppContext';
import { ROUTES } from '../../navigation/routes';

export default function QuickActions() {
  const { colors } = useTheme();
  const navigate = useAppNavigation();

  function handleAction(route) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigate(route);
  }

  return (
    <View style={styles.quickActionsRow}>
      <TouchableOpacity style={styles.quickAction} onPress={() => handleAction(ROUTES.ADD_DOCUMENT)}>
        <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="document-attach" size={22} color={colors.primary} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>Add Doc</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickAction} onPress={() => handleAction(ROUTES.ADD_ENTITY)}>
        <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(48, 209, 88, 0.15)' }]}>
          <Ionicons name="person-add" size={22} color={colors.success} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>Add Entity</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickAction} onPress={() => handleAction(ROUTES.ENTITIES)}>
        <View style={[styles.quickActionIcon, { backgroundColor: colors.warningLight }]}>
          <Ionicons name="grid" size={22} color={colors.accent} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>All Entities</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickAction} onPress={() => handleAction(ROUTES.SETTINGS)}>
        <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(142, 142, 147, 0.15)' }]}>
          <Ionicons name="settings" size={22} color={colors.textMuted} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 12, fontWeight: '700' },
});
