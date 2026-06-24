// ─── Color Palette ────────────────────────────────────────────────────────────

const palette = {
  // Primary - Indigo/Violet
  primary50: '#EEF2FF',
  primary100: '#E0E7FF',
  primary200: '#C7D2FE',
  primary300: '#A5B4FC',
  primary400: '#818CF8',
  primary500: '#6366F1',
  primary600: '#4F46E5',
  primary700: '#4338CA',
  primary800: '#3730A3',
  primary900: '#312E81',

  // Secondary - Emerald (for positive/income)
  secondary50: '#ECFDF5',
  secondary100: '#D1FAE5',
  secondary200: '#A7F3D0',
  secondary300: '#6EE7B7',
  secondary400: '#34D399',
  secondary500: '#10B981',
  secondary600: '#059669',
  secondary700: '#047857',
  secondary800: '#065F46',
  secondary900: '#064E3B',

  // Accent - Amber
  accent50: '#FFFBEB',
  accent100: '#FEF3C7',
  accent200: '#FDE68A',
  accent300: '#FCD34D',
  accent400: '#FBBF24',
  accent500: '#F59E0B',
  accent600: '#D97706',
  accent700: '#B45309',
  accent800: '#92400E',
  accent900: '#78350F',

  // Danger - Red
  danger50: '#FFF1F2',
  danger100: '#FFE4E6',
  danger200: '#FECDD3',
  danger300: '#FDA4AF',
  danger400: '#FB7185',
  danger500: '#F43F5E',
  danger600: '#E11D48',
  danger700: '#BE123C',
  danger800: '#9F1239',
  danger900: '#881337',

  // Neutrals
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

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const lightTheme = {
  // Brand
  primary: palette.primary500,
  primaryDark: palette.primary700,
  primaryLight: palette.primary300,
  primaryForeground: palette.white,

  secondary: palette.secondary500,
  secondaryDark: palette.secondary700,
  secondaryLight: palette.secondary300,
  secondaryForeground: palette.white,

  accent: palette.accent500,
  accentDark: palette.accent700,
  accentLight: palette.accent300,
  accentForeground: palette.white,

  danger: palette.danger500,
  dangerDark: palette.danger700,
  dangerLight: palette.danger100,
  dangerForeground: palette.white,

  // Surfaces
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfaceSubtle: palette.gray100,
  border: palette.gray200,
  borderStrong: palette.gray300,
  divider: palette.gray100,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textDisabled: palette.gray300,
  textInverse: palette.white,
  textOnPrimary: palette.white,

  // States
  success: palette.secondary500,
  successLight: palette.secondary50,
  warning: palette.accent500,
  warningLight: palette.accent50,
  error: palette.danger500,
  errorLight: palette.danger50,
  info: palette.primary500,
  infoLight: palette.primary50,

  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowStrong: 'rgba(0, 0, 0, 0.16)',
} as const;

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkTheme = {
  // Brand
  primary: palette.primary400,
  primaryDark: palette.primary600,
  primaryLight: palette.primary200,
  primaryForeground: palette.white,

  secondary: palette.secondary400,
  secondaryDark: palette.secondary600,
  secondaryLight: palette.secondary200,
  secondaryForeground: palette.white,

  accent: palette.accent400,
  accentDark: palette.accent600,
  accentLight: palette.accent200,
  accentForeground: palette.gray900,

  danger: palette.danger400,
  dangerDark: palette.danger600,
  dangerLight: palette.danger900,
  dangerForeground: palette.white,

  // Surfaces
  background: palette.gray900,
  surface: palette.gray800,
  surfaceElevated: palette.gray700,
  surfaceSubtle: palette.gray800,
  border: palette.gray700,
  borderStrong: palette.gray600,
  divider: palette.gray800,

  // Text
  textPrimary: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray600,
  textDisabled: palette.gray700,
  textInverse: palette.gray900,
  textOnPrimary: palette.white,

  // States
  success: palette.secondary400,
  successLight: palette.secondary900,
  warning: palette.accent400,
  warningLight: palette.accent900,
  error: palette.danger400,
  errorLight: palette.danger900,
  info: palette.primary400,
  infoLight: palette.primary900,

  // Misc
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)',
} as const;

export type Theme = typeof lightTheme;

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    mono: 'monospace',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
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
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

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
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  behind: -1,
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
} as const;