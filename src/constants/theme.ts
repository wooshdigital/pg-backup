import type { ThemeColors } from '../types';

// ─── Color Palette ────────────────────────────────────────────────────────────

export const palette = {
  // Brand
  violet50: '#F3F0FF',
  violet100: '#E5DBFF',
  violet200: '#C5B3FF',
  violet300: '#A58AFF',
  violet400: '#8B6EFF',
  violet500: '#6C63FF',
  violet600: '#5A52D5',
  violet700: '#4841AB',
  violet800: '#363081',
  violet900: '#241F57',

  // Teal accent
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0D9488',

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

  // Dark mode surfaces
  dark900: '#0A0A0F',
  dark800: '#12121A',
  dark700: '#1A1A2E',
  dark600: '#22223B',
  dark500: '#2D2D4A',

  // Semantic
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  yellow400: '#FACC15',
  yellow500: '#EAB308',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
} as const;

// ─── Light Theme ─────────────────────────────────────────────────────────────

export const lightColors: ThemeColors = {
  primary: palette.violet500,
  primaryLight: palette.violet300,
  primaryDark: palette.violet700,
  secondary: palette.teal500,
  accent: palette.teal400,
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  border: palette.gray200,
  borderLight: palette.gray100,
  text: palette.gray900,
  textSecondary: palette.gray500,
  textDisabled: palette.gray300,
  textInverse: palette.white,
  success: palette.green500,
  warning: palette.yellow500,
  error: palette.red500,
  info: palette.blue500,
  shadow: 'rgba(0, 0, 0, 0.08)',
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkColors: ThemeColors = {
  primary: palette.violet400,
  primaryLight: palette.violet300,
  primaryDark: palette.violet600,
  secondary: palette.teal400,
  accent: palette.teal500,
  background: palette.dark900,
  surface: palette.dark800,
  surfaceElevated: palette.dark700,
  border: palette.dark500,
  borderLight: palette.dark600,
  text: palette.gray50,
  textSecondary: palette.gray400,
  textDisabled: palette.gray600,
  textInverse: palette.gray900,
  success: palette.green400,
  warning: palette.yellow400,
  error: palette.red400,
  info: palette.blue400,
  shadow: 'rgba(0, 0, 0, 0.4)',
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 30,
    '4xl': 36,
    '5xl': 44,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;