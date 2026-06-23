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
import { darkTheme, lightTheme } from '../constants/theme';
import type { AppTheme, ThemeMode } from '../types';

// ─── Storage Key ──────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = '@app/themeMode';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface ThemeContextValue {
  /** The resolved theme object (never 'system') */
  theme: AppTheme;
  /** The user-selected mode, including 'system' */
  themeMode: ThemeMode;
  /** Whether the resolved theme is dark */
  isDark: boolean;
  /** Change the theme mode and persist it */
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  /** Toggle between light and dark */
  toggleTheme: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
ThemeContext.displayName = 'ThemeContext';

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Override for testing */
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode ?? 'system');
  const [isLoaded, setIsLoaded] = useState(initialMode !== undefined);

  // Load persisted theme on mount
  useEffect(() => {
    if (initialMode !== undefined) return;

    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored);
        }
      } catch (error) {
        console.warn('[ThemeContext] Failed to load theme from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    void loadTheme();
  }, [initialMode]);

  // Resolve dark/light from mode + system
  const isDark = useMemo<boolean>(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Resolved theme
  const theme = useMemo<AppTheme>(() => (isDark ? darkTheme : lightTheme), [isDark]);

  // Persist + update mode
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('[ThemeContext] Failed to persist theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    await setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themeMode, isDark, setThemeMode, toggleTheme }),
    [theme, themeMode, isDark, setThemeMode, toggleTheme]
  );

  // Avoid flash of wrong theme while loading from storage
  if (!isLoaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return context;
}