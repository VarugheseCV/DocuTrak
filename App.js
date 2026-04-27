import React, { useEffect, useState } from "react";
import { StatusBar, Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createInitialState } from "./src/data/seeds";
import { loadState, saveState } from "./src/data/store";
import { colors } from "./src/theme/theme";

// Screens
import DashboardScreen from "./src/screens/DashboardScreen";
import AddDocumentScreen from "./src/screens/AddDocumentScreen";
import AddEntityScreen from "./src/screens/AddEntityScreen";
import EntitiesScreen from "./src/screens/EntitiesScreen";
import EntityDetailScreen from "./src/screens/EntityDetailScreen";
import DocumentDetailScreen from "./src/screens/DocumentDetailScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlockApp = async (loadedState) => {
    if (loadedState?.profile?.appLockEnabled) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock DocuTrak'
      });
      if (auth.success) {
        setIsUnlocked(true);
      }
    } else {
      setIsUnlocked(true);
    }
  };

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      unlockApp(loaded);
      setLoading(false);
    });
  }, []);

  async function commit(updater) {
    const nextState = typeof updater === "function" ? updater(state) : updater;
    setState(nextState);
    await saveState(nextState);
  }

  if (loading || !isUnlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        {!loading && !isUnlocked ? (
          <TouchableOpacity onPress={() => unlockApp(state)} style={{ alignItems: 'center' }}>
            <Ionicons name="lock-closed" size={64} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>DocuTrak is Locked</Text>
            <Text style={{ color: colors.textMuted, marginTop: 8 }}>Tap to unlock</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ color: colors.textMuted }}>Loading...</Text>
        )}
      </View>
    );
  }

  // Wrapper components to inject state/commit into legacy screen API
  const ScreenWrapper = (Component) => (props) => (
    <Component 
      {...props} 
      state={state} 
      onCommit={commit} 
      onNavigate={(r, p) => {
        if (r === "dashboard" || r === "entities" || r === "settings") {
          props.navigation.navigate("Tabs", { screen: r, params: p });
        } else {
          props.navigation.navigate(r, p);
        }
      }} 
      params={props.route?.params}
    />
  );

  const TabNavigator = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 11, paddingBottom: 5 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'dashboard') iconName = 'home';
          else if (route.name === 'entities') iconName = 'people';
          else if (route.name === 'settings') iconName = 'settings';
          return <Ionicons name={iconName} size={24} color={color} style={{ marginTop: 5 }} />;
        },
      })}
    >
      <Tab.Screen name="dashboard" component={ScreenWrapper(DashboardScreen)} options={{ title: "Home" }} />
      <Tab.Screen name="entities" component={ScreenWrapper(EntitiesScreen)} options={{ title: "Entities" }} />
      <Tab.Screen name="settings" component={ScreenWrapper(SettingsScreen)} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );

  return (
    <GestureHandlerRootView style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="addDocument" component={ScreenWrapper(AddDocumentScreen)} />
            <Stack.Screen name="addEntity" component={ScreenWrapper(AddEntityScreen)} />
            <Stack.Screen name="entityDetail" component={ScreenWrapper(EntityDetailScreen)} />
            <Stack.Screen name="documentDetail" component={ScreenWrapper(DocumentDetailScreen)} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  tabBar: {
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
  }
});
