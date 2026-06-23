// ─── Color Palette ────────────────────────────────────────────────────────────

export const Colors = {
  // Brand
  primary: '#6C63FF',
  primaryLight: '#9D96FF',
  primaryDark: '#4B44CC',

  // Accent
  accent: '#FF6584',
  accentLight: '#FF92A8',
  accentDark: '#CC3D5E',

  // Success / Error / Warning / Info
  success: '#4CAF50',
  successLight: '#80E27E',
  successDark: '#087F23',

  error: '#F44336',
  errorLight: '#FF7961',
  errorDark: '#BA000D',

  warning: '#FF9800',
  warningLight: '#FFC947',
  warningDark: '#C66900',

  info: '#2196F3',
  infoLight: '#6EC6FF',
  infoDark: '#0069C0',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',

  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
} as const;

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const LightTheme = {
  mode: 'light' as const,
  colors: {
    // Backgrounds
    background: Colors.grey50,
    surface: Colors.white,
    surfaceVariant: Colors.grey100,

    // Text
    textPrimary: Colors.grey900,
    textSecondary: Colors.grey600,
    textDisabled: Colors.grey400,
    textInverse: Colors.white,

    // Brand
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    primaryDark: Colors.primaryDark,
    accent: Colors.accent,

    // Semantic
    success: Colors.success,
    error: Colors.error,
    warning: Colors.warning,
    info: Colors.info,

    // Borders & Dividers
    border: Colors.grey300,
    divider: Colors.grey200,

    // Tab bar / Nav
    tabBarBackground: Colors.white,
    tabBarActive: Colors.primary,
    tabBarInactive: Colors.grey400,

    // Card
    cardBackground: Colors.white,
    cardShadow: Colors.black,

    // Input
    inputBackground: Colors.white,
    inputBorder: Colors.grey300,
    inputFocusBorder: Colors.primary,
    placeholder: Colors.grey500,
  },
} as const;

export const DarkTheme = {
  mode: 'dark' as const,
  colors: {
    // Backgrounds
    background: Colors.grey900,
    surface: Colors.grey800,
    surfaceVariant: Colors.grey700,

    // Text
    textPrimary: Colors.grey50,
    textSecondary: Colors.grey400,
    textDisabled: Colors.grey600,
    textInverse: Colors.grey900,

    // Brand
    primary: Colors.primaryLight,
    primaryLight: Colors.primaryLight,
    primaryDark: Colors.primary,
    accent: Colors.accentLight,

    // Semantic
    success: Colors.successLight,
    error: Colors.errorLight,
    warning: Colors.warningLight,
    info: Colors.infoLight,

    // Borders & Dividers
    border: Colors.grey700,
    divider: Colors.grey800,

    // Tab bar / Nav
    tabBarBackground: Colors.grey800,
    tabBarActive: Colors.primaryLight,
    tabBarInactive: Colors.grey600,

    // Card
    cardBackground: Colors.grey800,
    cardShadow: Colors.black,

    // Input
    inputBackground: Colors.grey800,
    inputBorder: Colors.grey700,
    inputFocusBorder: Colors.primaryLight,
    placeholder: Colors.grey500,
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof LightTheme.colors;

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// ─── Typography ───────────────────────────────────────────────────────────────

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const FontWeights = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

export const LineHeights = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const LetterSpacings = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
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

// ─── Border Radii ─────────────────────────────────────────────────────────────

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  toast: 1400,
  tooltip: 1500,
} as const;