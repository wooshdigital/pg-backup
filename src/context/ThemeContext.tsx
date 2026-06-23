import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../constants/theme';
import type { ColorScheme, Theme, ThemeColors } from '../types';

// ─── Storage Key ─────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = '@tripsplit:theme';

// ─── Context Types ────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  colorScheme: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  useSystemTheme: boolean;
  setUseSystemTheme: (useSystem: boolean) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [useSystemTheme, setUseSystemThemeState] = useState(true);
  const [manualScheme, setManualScheme] = useState<ColorScheme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const AsyncStorage = (
          await import('@react-native-async-storage/async-storage')
        ).default;
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored) as {
            useSystem: boolean;
            scheme: ColorScheme;
          };
          setUseSystemThemeState(parsed.useSystem);
          setManualScheme(parsed.scheme);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    void loadThemePreference();
  }, []);

  // Persist preference whenever it changes
  const persistTheme = useCallback(
    async (useSystem: boolean, scheme: ColorScheme) => {
      try {
        const AsyncStorage = (
          await import('@react-native-async-storage/async-storage')
        ).default;
        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          JSON.stringify({ useSystem, scheme }),
        );
      } catch (error) {
        console.warn('Failed to persist theme preference:', error);
      }
    },
    [],
  );

  const colorScheme: ColorScheme = useMemo(() => {
    if (useSystemTheme) {
      return (systemColorScheme as ColorScheme | null) ?? 'light';
    }
    return manualScheme;
  }, [useSystemTheme, systemColorScheme, manualScheme]);

  const isDark = colorScheme === 'dark';
  const colors: ThemeColors = isDark ? darkColors : lightColors;

  const theme: Theme = useMemo(
    () => ({ colors, colorScheme }),
    [colors, colorScheme],
  );

  const toggleTheme = useCallback(() => {
    const nextScheme: ColorScheme = isDark ? 'light' : 'dark';
    setUseSystemThemeState(false);
    setManualScheme(nextScheme);
    void persistTheme(false, nextScheme);
  }, [isDark, persistTheme]);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setUseSystemThemeState(false);
      setManualScheme(scheme);
      void persistTheme(false, scheme);
    },
    [persistTheme],
  );

  const setUseSystemTheme = useCallback(
    (useSystem: boolean) => {
      setUseSystemThemeState(useSystem);
      void persistTheme(useSystem, manualScheme);
    },
    [manualScheme, persistTheme],
  );

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      colors,
      colorScheme,
      isDark,
      toggleTheme,
      setColorScheme,
      useSystemTheme,
      setUseSystemTheme,
    }),
    [
      theme,
      colors,
      colorScheme,
      isDark,
      toggleTheme,
      setColorScheme,
      useSystemTheme,
      setUseSystemTheme,
    ],
  );

  // Don't render until preferences are loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;