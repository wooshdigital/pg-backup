import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@constants/theme';
import type { Theme } from '@constants/theme';
import { useAsyncStorage } from '@hooks/useAsyncStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  colorMode: ColorMode;
  isDark: boolean;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@splitease/color-mode';

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const systemColorScheme = useColorScheme();
  const [storedMode, setStoredMode] = useAsyncStorage<ColorMode>(STORAGE_KEY, 'system');
  const [colorMode, setColorModeState] = useState<ColorMode>(storedMode ?? 'system');

  // Sync local state when storage loads
  useEffect(() => {
    if (storedMode) {
      setColorModeState(storedMode);
    }
  }, [storedMode]);

  const isDark = useMemo((): boolean => {
    if (colorMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return colorMode === 'dark';
  }, [colorMode, systemColorScheme]);

  const theme = useMemo((): Theme => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const setColorMode = useCallback(
    (mode: ColorMode) => {
      setColorModeState(mode);
      void setStoredMode(mode);
    },
    [setStoredMode],
  );

  const toggleColorMode = useCallback(() => {
    const next: ColorMode = isDark ? 'light' : 'dark';
    setColorMode(next);
  }, [isDark, setColorMode]);

  const value = useMemo(
    (): ThemeContextValue => ({
      theme,
      colorMode,
      isDark,
      setColorMode,
      toggleColorMode,
    }),
    [theme, colorMode, isDark, setColorMode, toggleColorMode],
  );

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