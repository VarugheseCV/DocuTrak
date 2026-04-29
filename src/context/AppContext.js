import { createContext, useContext, useCallback, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../navigation/routes';
import { lightColors, darkColors } from '../theme/theme';

const DataContext = createContext(null);
const ThemeContext = createContext(null);

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

  const dataValue = useMemo(() => ({ state, commit }), [state, commit]);
  const themeValue = useMemo(() => ({ colors, isDark, toggleTheme }), [colors, isDark, toggleTheme]);

  return (
    <DataContext.Provider value={dataValue}>
      <ThemeContext.Provider value={themeValue}>
        {children}
      </ThemeContext.Provider>
    </DataContext.Provider>
  );
}

// Legacy hook for backwards compatibility
export function useAppState() {
  const data = useContext(DataContext);
  const theme = useContext(ThemeContext);
  if (!data || !theme) throw new Error('useAppState must be used within AppProvider');
  return { ...data, ...theme };
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within AppProvider');
  return context;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within AppProvider');
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
