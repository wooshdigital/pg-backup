// ─── Color Palette ───────────────────────────────────────────────────────────

const palette = {
  // Brand
  purple50: '#F3F0FF',
  purple100: '#E5DBFF',
  purple200: '#C9B9FF',
  purple300: '#AC97FF',
  purple400: '#9075FF',
  purple500: '#6C63FF',
  purple600: '#5A50D6',
  purple700: '#463DAD',
  purple800: '#322B85',
  purple900: '#1F1A5C',

  // Accent
  teal400: '#26C6DA',
  teal500: '#00BCD4',
  teal600: '#00ACC1',

  // Semantic
  green400: '#66BB6A',
  green500: '#4CAF50',
  green600: '#43A047',

  red400: '#EF5350',
  red500: '#F44336',
  red600: '#E53935',

  amber400: '#FFCA28',
  amber500: '#FFC107',
  amber600: '#FFB300',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  black: '#000000',

  // Transparent
  transparent: 'transparent',
} as const;

// ─── Light Theme Colors ───────────────────────────────────────────────────────

export const lightColors = {
  // Brand
  primary: palette.purple500,
  primaryLight: palette.purple300,
  primaryDark: palette.purple700,
  accent: palette.teal500,

  // Backgrounds
  background: palette.gray50,
  surface: palette.white,
  surfaceVariant: palette.gray100,
  card: palette.white,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textDisabled: palette.gray400,
  textInverse: palette.white,
  textOnPrimary: palette.white,

  // Borders
  border: palette.gray300,
  borderFocus: palette.purple500,

  // Semantic
  success: palette.green500,
  warning: palette.amber500,
  error: palette.red500,
  info: palette.teal500,

  // Misc
  shadow: palette.black,
  overlay: 'rgba(0, 0, 0, 0.5)',
  tabBarBackground: palette.white,
  tabBarActive: palette.purple500,
  tabBarInactive: palette.gray500,
  statusBar: 'dark',
} as const;

export const darkColors = {
  // Brand
  primary: palette.purple400,
  primaryLight: palette.purple300,
  primaryDark: palette.purple600,
  accent: palette.teal400,

  // Backgrounds
  background: palette.gray900,
  surface: palette.gray800,
  surfaceVariant: palette.gray700,
  card: palette.gray800,

  // Text
  textPrimary: palette.gray50,
  textSecondary: palette.gray400,
  textDisabled: palette.gray600,
  textInverse: palette.gray900,
  textOnPrimary: palette.white,

  // Borders
  border: palette.gray700,
  borderFocus: palette.purple400,

  // Semantic
  success: palette.green400,
  warning: palette.amber400,
  error: palette.red400,
  info: palette.teal400,

  // Misc
  shadow: palette.black,
  overlay: 'rgba(0, 0, 0, 0.7)',
  tabBarBackground: palette.gray800,
  tabBarActive: palette.purple400,
  tabBarInactive: palette.gray500,
  statusBar: 'light',
} as const;

export type ColorTokens = typeof lightColors;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const letterSpacings = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
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

// ─── Border Radii ─────────────────────────────────────────────────────────────

export const radii = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 1,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ─── Theme Object ─────────────────────────────────────────────────────────────

export const lightTheme = {
  colors: lightColors,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  spacing,
  radii,
  shadows,
  zIndex,
  isDark: false,
} as const;

export const darkTheme = {
  colors: darkColors,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  spacing,
  radii,
  shadows,
  zIndex,
  isDark: true,
} as const;

export type Theme = typeof lightTheme;