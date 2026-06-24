// ─── Color Palette ────────────────────────────────────────────────────────────

const palette = {
  // Primary — Indigo
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo300: '#A5B4FC',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
  indigo800: '#3730A3',
  indigo900: '#312E81',

  // Secondary — Emerald
  emerald50: '#ECFDF5',
  emerald100: '#D1FAE5',
  emerald200: '#A7F3D0',
  emerald300: '#6EE7B7',
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065F46',
  emerald900: '#064E3B',

  // Accent — Amber
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber300: '#FCD34D',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',
  amber800: '#92400E',
  amber900: '#78350F',

  // Danger — Rose
  rose50: '#FFF1F2',
  rose100: '#FFE4E6',
  rose400: '#FB7185',
  rose500: '#F43F5E',
  rose600: '#E11D48',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
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
} as const;

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const lightTheme = {
  dark: false,
  colors: {
    // Backgrounds
    background: palette.gray50,
    surface: palette.white,
    surfaceSecondary: palette.gray100,

    // Text
    textPrimary: palette.gray900,
    textSecondary: palette.gray600,
    textDisabled: palette.gray400,
    textInverse: palette.white,

    // Brand
    primary: palette.indigo500,
    primaryLight: palette.indigo100,
    primaryDark: palette.indigo700,

    // Semantic
    success: palette.emerald500,
    successLight: palette.emerald50,
    warning: palette.amber500,
    warningLight: palette.amber50,
    danger: palette.rose500,
    dangerLight: palette.rose50,

    // Borders
    border: palette.gray200,
    borderStrong: palette.gray300,

    // Tab bar
    tabBarBackground: palette.white,
    tabBarActive: palette.indigo500,
    tabBarInactive: palette.gray400,

    // Card
    cardBackground: palette.white,
    cardShadow: palette.black,
  },
} as const;

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkTheme = {
  dark: true,
  colors: {
    // Backgrounds
    background: palette.gray900,
    surface: palette.gray800,
    surfaceSecondary: palette.gray700,

    // Text
    textPrimary: palette.gray50,
    textSecondary: palette.gray400,
    textDisabled: palette.gray600,
    textInverse: palette.gray900,

    // Brand
    primary: palette.indigo400,
    primaryLight: palette.indigo900,
    primaryDark: palette.indigo200,

    // Semantic
    success: palette.emerald400,
    successLight: palette.emerald900,
    warning: palette.amber400,
    warningLight: palette.amber900,
    danger: palette.rose400,
    dangerLight: palette.rose100,

    // Borders
    border: palette.gray700,
    borderStrong: palette.gray600,

    // Tab bar
    tabBarBackground: palette.gray800,
    tabBarActive: palette.indigo400,
    tabBarInactive: palette.gray500,

    // Card
    cardBackground: palette.gray800,
    cardShadow: palette.black,
  },
} as const;

export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'Courier',
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
    '4xl': 34,
    '5xl': 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────────

export const animation = {
  fast: 150,
  base: 250,
  slow: 400,
  slower: 600,
} as const;