import React, { createContext, useContext, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../navigation/routes';
import { lightColors, darkColors } from '../theme/theme';

const AppContext = createContext(null);

export function AppProvider({ state, commit, children }) {
  const themeMode = state.profile?.themeMode || 'dark';
  const colors = themeMode === 'light' ? lightColors : darkColors;
  const isDark = themeMode === 'dark';

  const toggleTheme = useCallback(() => {
    commit({
      ...state,
      profile: {
        ...state.profile,
        themeMode: isDark ? 'light' : 'dark'
      }
    });
  }, [state, commit, isDark]);

  return (
    <AppContext.Provider value={{ state, commit, colors, isDark, toggleTheme }}>
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
    navigation.navigate(route, params);
  }, [navigation]);
}

export function useScreenParams() {
  const route = useRoute();
  return route.params || {};
}
