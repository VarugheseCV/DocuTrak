import React, { createContext, useContext, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

const AppContext = createContext(null);

export function AppProvider({ state, commit, children }) {
  return (
    <AppContext.Provider value={{ state, commit }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}

export function useAppNavigation() {
  const navigation = useNavigation();
  return useCallback((route, params) => {
    const tabRoutes = ['dashboard', 'entities', 'settings'];
    if (tabRoutes.includes(route)) {
      navigation.navigate("Tabs", { screen: route, params });
    } else {
      navigation.navigate(route, params);
    }
  }, [navigation]);
}

export function useScreenParams() {
  const route = useRoute();
  return route.params || {};
}
