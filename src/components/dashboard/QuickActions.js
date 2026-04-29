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
        <View style={[styles.quickActionIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>Add Doc</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction} onPress={() => handleAction(ROUTES.ADD_ENTITY)}>
        <View style={[styles.quickActionIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="person-add" size={20} color={colors.success} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>Add Entity</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction} onPress={() => handleAction(ROUTES.ENTITIES)}>
        <View style={[styles.quickActionIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="grid" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>All Entities</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction} onPress={() => handleAction(ROUTES.SETTINGS)}>
        <View style={[styles.quickActionIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="settings" size={20} color={colors.textMuted} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 28 
  },
  quickAction: { 
    alignItems: 'center', 
    flex: 1 
  },
  quickActionIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    // Soft depth without borders
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionLabel: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
});
