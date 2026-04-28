import React, { useEffect, useState, useRef, useCallback } from "react";
import { StatusBar, Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { NavigationContainer } from '@react-navigation/native';

import { createInitialState } from "./src/data/seeds";
import { loadState, saveState } from "./src/data/store";
import { colors } from "./src/theme/theme";
import { AppProvider } from "./src/context/AppContext";
import RootStack from "./src/navigation/RootStack";

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

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
    loadState().then((loaded) => {
      setState(loaded);
      stateRef.current = loaded;
      unlockApp(loaded);
      setLoading(false);
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
    return (
      <View style={styles.lockScreen}>
        {!loading && !isUnlocked ? (
          <TouchableOpacity onPress={() => unlockApp(state)} style={{ alignItems: 'center' }}>
            <Ionicons name="lock-closed" size={64} color={colors.primary} />
            <Text style={styles.lockTitle}>DocuTrak is Locked</Text>
            <Text style={styles.lockSub}>Tap to unlock</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.lockSub}>Loading...</Text>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
  appContainer: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  lockScreen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  lockTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  lockSub: { color: colors.textMuted, marginTop: 8 },
});
