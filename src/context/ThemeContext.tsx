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
import { createTheme, Theme } from '../constants/theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = '@tripsplit/theme_preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPreferenceState(saved);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPreference();
  }, []);

  const setPreference = useCallback(async (newPreference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newPreference);
      setPreferenceState(newPreference);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
      setPreferenceState(newPreference);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = preference === 'dark' ? 'light' : 'dark';
    setPreference(next);
  }, [preference, setPreference]);

  const isDark = useMemo(() => {
    if (preference === 'system') {
      return systemColorScheme === 'dark';
    }
    return preference === 'dark';
  }, [preference, systemColorScheme]);

  const theme = useMemo(() => createTheme(isDark), [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference,
      isDark,
      setPreference,
      toggleTheme,
    }),
    [theme, preference, isDark, setPreference, toggleTheme],
  );

  // Don't render until preference is loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeContext };