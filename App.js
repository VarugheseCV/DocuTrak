import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { createInitialState } from "./src/data/seeds";
import { loadState, saveState } from "./src/data/store";
import { colors } from "./src/theme/theme";

// Screens
import DashboardScreen from "./src/screens/DashboardScreen";
import AddDocumentScreen from "./src/screens/AddDocumentScreen";
import EntitiesScreen from "./src/screens/EntitiesScreen";
import EntityDetailScreen from "./src/screens/EntityDetailScreen";
import DocumentDetailScreen from "./src/screens/DocumentDetailScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Custom router
  const [screen, setScreen] = useState("dashboard");
  const [params, setParams] = useState({});

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

  function navigate(routeName, routeParams = {}) {
    setScreen(routeName);
    setParams(routeParams);
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

  let ScreenComponent;
  switch (screen) {
    case "dashboard":
      ScreenComponent = <DashboardScreen state={state} onNavigate={navigate} />;
      break;
    case "addDocument":
      ScreenComponent = <AddDocumentScreen state={state} onCommit={commit} onNavigate={navigate} />;
      break;
    case "entities":
      ScreenComponent = <EntitiesScreen state={state} onNavigate={navigate} />;
      break;
    case "entityDetail":
      ScreenComponent = <EntityDetailScreen state={state} onNavigate={navigate} params={params} />;
      break;
    case "documentDetail":
      ScreenComponent = <DocumentDetailScreen state={state} onCommit={commit} onNavigate={navigate} params={params} />;
      break;
    case "settings":
      ScreenComponent = <SettingsScreen state={state} onCommit={commit} onNavigate={navigate} />;
      break;
    default:
      ScreenComponent = <DashboardScreen state={state} onNavigate={navigate} />;
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          {ScreenComponent}
        </View>
        
        {/* Bottom Navigation */}
        {(screen === "dashboard" || screen === "entities" || screen === "settings") && (
          <View style={styles.navWrapper}>
            <View style={styles.bottomNav}>
              <NavButton title="Home" icon="home" active={screen === "dashboard"} onPress={() => navigate("dashboard")} />
              <NavButton title="Entities" icon="people" active={screen === "entities"} onPress={() => navigate("entities")} />
              <NavButton title="Settings" icon="settings" active={screen === "settings"} onPress={() => navigate("settings")} />
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function NavButton({ title, icon, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.navBtn}>
      <Ionicons 
        name={active ? icon : `${icon}-outline`} 
        size={24} 
        color={active ? colors.primary : colors.textMuted} 
        style={{ marginBottom: 4 }}
      />
      <Text style={{
        fontSize: 12,
        fontWeight: active ? 'bold' : '600',
        color: active ? colors.primary : colors.textMuted
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background, // Pure OLED black
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentWrapper: {
    flex: 1,
  },
  navWrapper: {
    backgroundColor: '#121212', // Solid color instead of BlurView
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomNav: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    alignItems: 'center',
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
