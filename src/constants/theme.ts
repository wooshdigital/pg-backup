import type { AppTheme } from '../types';

// ─── Color Palette ────────────────────────────────────────────────────────────

const palette = {
  // Primary (Purple)
  purple50: '#F3F0FF',
  purple100: '#E5DEFF',
  purple200: '#C4B5FD',
  purple300: '#A78BFA',
  purple400: '#8B5CF6',
  purple500: '#6C63FF',
  purple600: '#5B4FD9',
  purple700: '#4C3BBF',
  purple800: '#3D2FA6',
  purple900: '#2E228C',

  // Secondary (Teal)
  teal50: '#F0FDFA',
  teal100: '#CCFBF1',
  teal200: '#99F6E4',
  teal300: '#5EEAD4',
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0D9488',
  teal700: '#0F766E',
  teal800: '#115E59',
  teal900: '#134E4A',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Semantic
  red500: '#EF4444',
  red600: '#DC2626',
  green500: '#22C55E',
  green600: '#16A34A',
  yellow500: '#EAB308',
  yellow600: '#CA8A04',
  blue500: '#3B82F6',
  blue600: '#2563EB',

  // Dark mode surfaces
  dark100: '#1A1A2E',
  dark200: '#16213E',
  dark300: '#0F3460',
  dark400: '#252540',
  dark500: '#2D2D4E',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

const typography: AppTheme['typography'] = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// ─── Spacing Scale ────────────────────────────────────────────────────────────

const spacing: AppTheme['spacing'] = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ─── Border Radius ────────────────────────────────────────────────────────────

const borderRadius: AppTheme['borderRadius'] = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
};

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    primary: palette.purple500,
    primaryLight: palette.purple300,
    primaryDark: palette.purple700,
    secondary: palette.teal500,
    secondaryLight: palette.teal300,
    secondaryDark: palette.teal700,
    background: palette.gray50,
    surface: palette.white,
    surfaceVariant: palette.gray100,
    error: palette.red500,
    success: palette.green500,
    warning: palette.yellow500,
    info: palette.blue500,
    text: palette.gray900,
    textSecondary: palette.gray500,
    textDisabled: palette.gray400,
    textInverse: palette.white,
    border: palette.gray200,
    borderLight: palette.gray100,
    shadow: palette.gray900,
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: palette.white,
  },
  typography,
  spacing,
  borderRadius,
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    primary: palette.purple400,
    primaryLight: palette.purple300,
    primaryDark: palette.purple600,
    secondary: palette.teal400,
    secondaryLight: palette.teal300,
    secondaryDark: palette.teal600,
    background: palette.dark100,
    surface: palette.dark400,
    surfaceVariant: palette.dark500,
    error: palette.red500,
    success: palette.green500,
    warning: palette.yellow500,
    info: palette.blue500,
    text: palette.gray50,
    textSecondary: palette.gray400,
    textDisabled: palette.gray600,
    textInverse: palette.gray900,
    border: palette.dark500,
    borderLight: palette.dark400,
    shadow: palette.black,
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: palette.dark400,
  },
  typography,
  spacing,
  borderRadius,
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const themes = { light: lightTheme, dark: darkTheme } as const;
export { palette, typography, spacing, borderRadius };