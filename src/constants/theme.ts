// ─── Color Palette ─────────────────────────────────────────────────────────────

export const Palette = {
  // Brand
  primary: {
    50: '#F0EEFF',
    100: '#E0DCFF',
    200: '#C1BAFF',
    300: '#9F96FF',
    400: '#8077FF',
    500: '#6C63FF', // Main brand color
    600: '#5A52D5',
    700: '#4842AB',
    800: '#363281',
    900: '#242257',
  },
  // Secondary / Accent
  secondary: {
    50: '#FFF0F6',
    100: '#FFE0ED',
    200: '#FFC2DA',
    300: '#FFA3C8',
    400: '#FF7FB2',
    500: '#FF6B9D', // Accent
    600: '#D5587F',
    700: '#AB4563',
    800: '#813248',
    900: '#571F2E',
  },
  // Success
  success: {
    50: '#EDFBF3',
    100: '#D2F5E0',
    200: '#A6ECC1',
    300: '#79E2A3',
    400: '#4DD884',
    500: '#27AE60',
    600: '#208E4E',
    700: '#196F3D',
    800: '#12502B',
    900: '#0B3019',
  },
  // Warning
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Error / Danger
  error: {
    50: '#FFF1F0',
    100: '#FFE0DE',
    200: '#FFC1BD',
    300: '#FFA29C',
    400: '#FF7B73',
    500: '#E74C3C',
    600: '#C0392B',
    700: '#96271F',
    800: '#6C1714',
    900: '#420E0B',
  },
  // Neutrals (Gray scale)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    1000: '#000000',
  },
} as const;

// ─── Semantic Color Tokens ─────────────────────────────────────────────────────

export interface ColorTokens {
  // Background
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  // Surface (cards, sheets, etc.)
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  // Text
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
  };
  // Border
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  // Brand
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // Status
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // Interactive
  interactive: {
    default: string;
    hover: string;
    pressed: string;
    disabled: string;
  };
}

export const LightColors: ColorTokens = {
  background: {
    primary: Palette.neutral[0],
    secondary: Palette.neutral[50],
    tertiary: Palette.neutral[100],
    inverse: Palette.neutral[900],
  },
  surface: {
    primary: Palette.neutral[0],
    secondary: Palette.neutral[50],
    elevated: Palette.neutral[0],
  },
  text: {
    primary: Palette.neutral[900],
    secondary: Palette.neutral[600],
    tertiary: Palette.neutral[400],
    disabled: Palette.neutral[300],
    inverse: Palette.neutral[0],
    link: Palette.primary[500],
  },
  border: {
    subtle: Palette.neutral[100],
    default: Palette.neutral[200],
    strong: Palette.neutral[400],
  },
  brand: {
    primary: Palette.primary[500],
    secondary: Palette.primary[100],
    accent: Palette.secondary[500],
  },
  status: {
    success: Palette.success[500],
    warning: Palette.warning[500],
    error: Palette.error[500],
    info: Palette.primary[500],
  },
  interactive: {
    default: Palette.primary[500],
    hover: Palette.primary[600],
    pressed: Palette.primary[700],
    disabled: Palette.neutral[300],
  },
};

export const DarkColors: ColorTokens = {
  background: {
    primary: Palette.neutral[900],
    secondary: Palette.neutral[800],
    tertiary: Palette.neutral[700],
    inverse: Palette.neutral[0],
  },
  surface: {
    primary: Palette.neutral[800],
    secondary: Palette.neutral[700],
    elevated: Palette.neutral[700],
  },
  text: {
    primary: Palette.neutral[50],
    secondary: Palette.neutral[300],
    tertiary: Palette.neutral[500],
    disabled: Palette.neutral[600],
    inverse: Palette.neutral[900],
    link: Palette.primary[300],
  },
  border: {
    subtle: Palette.neutral[700],
    default: Palette.neutral[600],
    strong: Palette.neutral[400],
  },
  brand: {
    primary: Palette.primary[400],
    secondary: Palette.primary[900],
    accent: Palette.secondary[400],
  },
  status: {
    success: Palette.success[400],
    warning: Palette.warning[400],
    error: Palette.error[400],
    info: Palette.primary[400],
  },
  interactive: {
    default: Palette.primary[400],
    hover: Palette.primary[300],
    pressed: Palette.primary[200],
    disabled: Palette.neutral[700],
  },
};

// ─── Spacing Scale ─────────────────────────────────────────────────────────────

export const Spacing = {
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 32px */
  xxxl: 32,
  /** 40px */
  xxxxl: 40,
  /** 48px */
  huge: 48,
  /** 64px */
  massive: 64,
} as const;

// ─── Typography ────────────────────────────────────────────────────────────────

export const FontSize = {
  /** 10px */
  xxs: 10,
  /** 12px */
  xs: 12,
  /** 14px */
  sm: 14,
  /** 16px */
  md: 16,
  /** 18px */
  lg: 18,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 28px */
  xxxl: 28,
  /** 32px */
  display: 32,
  /** 40px */
  hero: 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────────

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// ─── Shadows ───────────────────────────────────────────────────────────────────

export const Shadows = {
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
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// ─── Z-Index ───────────────────────────────────────────────────────────────────

export const ZIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ─── Composed Theme ────────────────────────────────────────────────────────────

export interface Theme {
  colors: ColorTokens;
  spacing: typeof Spacing;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  lineHeight: typeof LineHeight;
  letterSpacing: typeof LetterSpacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  zIndex: typeof ZIndex;
  isDark: boolean;
}

export const createTheme = (isDark: boolean): Theme => ({
  colors: isDark ? DarkColors : LightColors,
  spacing: Spacing,
  fontSize: FontSize,
  fontWeight: FontWeight,
  lineHeight: LineHeight,
  letterSpacing: LetterSpacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  zIndex: ZIndex,
  isDark,
});