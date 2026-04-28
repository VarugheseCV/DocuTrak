import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { ROUTES } from './routes';

import DashboardScreen from '../screens/DashboardScreen';
import EntitiesScreen from '../screens/EntitiesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 11, paddingBottom: 5 },
        tabBarIcon: ({ color }) => {
          const icons = {
            [ROUTES.DASHBOARD]: 'home',
            [ROUTES.ENTITIES]: 'people',
            [ROUTES.SETTINGS]: 'settings',
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} style={{ marginTop: 5 }} />;
        },
      })}
    >
      <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} options={{ title: "Home" }} />
      <Tab.Screen name={ROUTES.ENTITIES} component={EntitiesScreen} options={{ title: "Entities" }} />
      <Tab.Screen name={ROUTES.SETTINGS} component={SettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
}

const tabBarStyle = {
  backgroundColor: '#121212',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.08)',
  height: Platform.OS === 'ios' ? 85 : 65,
  paddingBottom: Platform.OS === 'ios' ? 20 : 5,
};
