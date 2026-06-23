import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, LightTheme } from '../constants/theme';
import type { Theme, ThemeMode } from '../constants/theme';

// ─── Storage Key ─────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = '@tripsplit/theme_mode';

// ─── Context Types ────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    systemColorScheme === 'dark' ? 'dark' : 'light',
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setThemeModeState(stored);
        } else if (systemColorScheme) {
          setThemeModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.warn('[ThemeContext] Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    void loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist theme change
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.warn('[ThemeContext] Failed to persist theme preference:', error);
      setThemeModeState(mode);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    void setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  }, [themeMode, setThemeMode]);

  const theme: Theme = useMemo(
    () => (themeMode === 'dark' ? DarkTheme : LightTheme),
    [themeMode],
  );

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      themeMode,
      isDark: themeMode === 'dark',
      toggleTheme,
      setThemeMode: (mode: ThemeMode) => void setThemeMode(mode),
    }),
    [theme, themeMode, toggleTheme, setThemeMode],
  );

  // Prevent flash of wrong theme
  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export type { ThemeContextValue };
export { ThemeContext };