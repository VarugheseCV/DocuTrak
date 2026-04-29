import React, { useEffect, useState, useRef, useCallback } from "react";
import { StatusBar, Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { NavigationContainer } from '@react-navigation/native';

import { createInitialState } from "./src/data/seeds";
import { loadState, saveState } from "./src/data/store";
import { lightColors, darkColors } from "./src/theme/theme";
import { AppProvider } from "./src/context/AppContext";
import RootStack from "./src/navigation/RootStack";
import { scheduleExpiryNotifications } from "./src/services/notifications";
import { runHealthChecks } from "./src/services/healthCheck";
import SkeletonLoader from "./src/components/SkeletonLoader";

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Derived theme info for root level
  const isDark = state.profile?.themeMode !== "light";
  const colors = isDark ? darkColors : lightColors;

  const unlockApp = async (loadedState) => {
    if (loadedState?.profile?.appLockEnabled) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock DocuTrak'
      });
      if (auth.success) setIsUnlocked(true);
    } else {
      setIsUnlocked(true);
    }
  };

  useEffect(() => {
    loadState().then(async (loaded) => {
      // Run health checks on every boot — auto-repair expired docs, orphaned images, etc.
      const { state: healthyState, repaired } = runHealthChecks(loaded);
      if (repaired) {
        await saveState(healthyState);
      }
      setState(healthyState);
      stateRef.current = healthyState;
      unlockApp(healthyState);
      setLoading(false);
      scheduleExpiryNotifications(healthyState);
    });
  }, []);

  const commit = useCallback(async (updater) => {
    const current = stateRef.current;
    const nextState = typeof updater === "function" ? updater(current) : updater;
    setState(nextState);
    stateRef.current = nextState;
    await saveState(nextState);
  }, []);

  if (loading || !isUnlocked) {
    if (loading) {
      return (
        <View style={{ flex: 1 }}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
          <SkeletonLoader colors={colors} />
        </View>
      );
    }

    return (
      <View style={[styles.lockScreen, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => unlockApp(state)} style={{ alignItems: 'center' }}>
          <Ionicons name="lock-closed" size={64} color={colors.primary} />
          <Text style={[styles.lockTitle, { color: colors.text }]}>DocuTrak is Locked</Text>
          <Text style={[styles.lockSub, { color: colors.textMuted }]}>Tap to unlock</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.appContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppProvider state={state} commit={commit}>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  lockScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lockTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  lockSub: { marginTop: 8 },
});

