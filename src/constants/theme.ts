// ─── Palette ──────────────────────────────────────────────────────────────────

const palette = {
  // Brand
  purple50: '#F3F0FF',
  purple100: '#E5DBFF',
  purple200: '#C9B8FF',
  purple300: '#A990FF',
  purple400: '#8B6BFF',
  purple500: '#6C63FF', // Primary brand color
  purple600: '#5549E8',
  purple700: '#4138C4',
  purple800: '#302A9A',
  purple900: '#221E72',

  // Teal accent
  teal50: '#E6FFFA',
  teal100: '#B2F5EA',
  teal300: '#4FD1C5',
  teal500: '#38B2AC', // Accent color
  teal700: '#2C7A7B',

  // Semantic
  green400: '#48BB78',
  green500: '#38A169',
  red400: '#FC8181',
  red500: '#E53E3E',
  yellow400: '#F6E05E',
  yellow500: '#D69E2E',
  orange400: '#F6AD55',
  orange500: '#DD6B20',

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
} as const;

// ─── Color Tokens ─────────────────────────────────────────────────────────────

export interface ThemeColors {
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;

  // Background layers
  background: string;
  surface: string;
  surfaceElevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textOnPrimary: string;

  // Border
  border: string;
  borderLight: string;

  // Semantic
  success: string;
  error: string;
  warning: string;
  info: string;

  successLight: string;
  errorLight: string;
  warningLight: string;

  // Tab bar
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightColors: ThemeColors = {
  primary: palette.purple500,
  primaryLight: palette.purple100,
  primaryDark: palette.purple700,
  accent: palette.teal500,

  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,

  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  textOnPrimary: palette.white,

  border: palette.gray200,
  borderLight: palette.gray100,

  success: palette.green500,
  error: palette.red500,
  warning: palette.yellow500,
  info: palette.purple500,

  successLight: '#F0FFF4',
  errorLight: '#FFF5F5',
  warningLight: '#FFFFF0',

  tabBarBackground: palette.white,
  tabBarActive: palette.purple500,
  tabBarInactive: palette.gray400,
};

export const darkColors: ThemeColors = {
  primary: palette.purple400,
  primaryLight: palette.purple900,
  primaryDark: palette.purple300,
  accent: palette.teal300,

  background: palette.gray900,
  surface: palette.gray800,
  surfaceElevated: palette.gray700,

  textPrimary: palette.gray50,
  textSecondary: palette.gray300,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,
  textOnPrimary: palette.white,

  border: palette.gray700,
  borderLight: palette.gray800,

  success: palette.green400,
  error: palette.red400,
  warning: palette.yellow400,
  info: palette.purple400,

  successLight: '#1C4532',
  errorLight: '#742A2A',
  warningLight: '#744210',

  tabBarBackground: palette.gray800,
  tabBarActive: palette.purple400,
  tabBarInactive: palette.gray500,
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  '5xl': 40,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// ─── Spacing Scale ────────────────────────────────────────────────────────────

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
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// ─── Border Radii ─────────────────────────────────────────────────────────────

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
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1700,
  tooltip: 1800,
} as const;

// ─── Full Theme Object ────────────────────────────────────────────────────────

export interface Theme {
  colors: ThemeColors;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
  isDark: boolean;
}

export function createTheme(isDark: boolean): Theme {
  return {
    colors: isDark ? darkColors : lightColors,
    fontSizes,
    fontWeights,
    lineHeights,
    spacing,
    borderRadius,
    shadows,
    zIndex,
    isDark,
  };
}

export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);