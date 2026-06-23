import React from 'react';
import {
  Text,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type TextProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  FontSizes,
  FontWeights,
  LineHeights,
  LetterSpacings,
} from '../../constants/theme';

// ─── Base Typography ─────────────────────────────────────────────────────────

interface BaseTextProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

// ─── Heading ──────────────────────────────────────────────────────────────────

interface HeadingProps extends BaseTextProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({
  children,
  level = 1,
  style,
  color,
  align = 'auto',
  ...props
}: HeadingProps) {
  const { theme } = useTheme();

  const levelStyles: Record<number, TextStyle> = {
    1: {
      fontSize: FontSizes['3xl'],
      fontWeight: FontWeights.bold,
      lineHeight: FontSizes['3xl'] * LineHeights.tight,
      letterSpacing: LetterSpacings.tight,
    },
    2: {
      fontSize: FontSizes['2xl'],
      fontWeight: FontWeights.bold,
      lineHeight: FontSizes['2xl'] * LineHeights.snug,
      letterSpacing: LetterSpacings.tight,
    },
    3: {
      fontSize: FontSizes.xl,
      fontWeight: FontWeights.semiBold,
      lineHeight: FontSizes.xl * LineHeights.snug,
      letterSpacing: LetterSpacings.normal,
    },
    4: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.semiBold,
      lineHeight: FontSizes.lg * LineHeights.normal,
      letterSpacing: LetterSpacings.normal,
    },
    5: {
      fontSize: FontSizes.base,
      fontWeight: FontWeights.semiBold,
      lineHeight: FontSizes.base * LineHeights.normal,
      letterSpacing: LetterSpacings.normal,
    },
    6: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semiBold,
      lineHeight: FontSizes.md * LineHeights.normal,
      letterSpacing: LetterSpacings.wide,
    },
  };

  return (
    <Text
      style={[
        levelStyles[level],
        {
          color: color ?? theme.colors.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      accessibilityRole="header"
      {...props}
    >
      {children}
    </Text>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

interface BodyProps extends BaseTextProps {
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semiBold';
}

export function Body({
  children,
  size = 'md',
  weight = 'normal',
  style,
  color,
  align = 'auto',
  ...props
}: BodyProps) {
  const { theme } = useTheme();

  const fontSizeMap: Record<string, number> = {
    sm: FontSizes.sm,
    md: FontSizes.base,
    lg: FontSizes.lg,
  };

  const fontWeightMap: Record<string, string> = {
    normal: FontWeights.normal,
    medium: FontWeights.medium,
    semiBold: FontWeights.semiBold,
  };

  return (
    <Text
      style={[
        styles.body,
        {
          fontSize: fontSizeMap[size],
          fontWeight: fontWeightMap[weight] as TextStyle['fontWeight'],
          lineHeight: fontSizeMap[size] * LineHeights.relaxed,
          color: color ?? theme.colors.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// ─── Caption ──────────────────────────────────────────────────────────────────

interface CaptionProps extends BaseTextProps {
  muted?: boolean;
}

export function Caption({
  children,
  muted = false,
  style,
  color,
  align = 'auto',
  ...props
}: CaptionProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.caption,
        {
          color: color ?? (muted ? theme.colors.textSecondary : theme.colors.textPrimary),
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

interface LabelProps extends BaseTextProps {
  uppercase?: boolean;
}

export function Label({
  children,
  uppercase = false,
  style,
  color,
  align = 'auto',
  ...props
}: LabelProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.label,
        {
          color: color ?? theme.colors.textSecondary,
          textTransform: uppercase ? 'uppercase' : 'none',
          letterSpacing: uppercase ? LetterSpacings.widest : LetterSpacings.wide,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  body: {
    letterSpacing: LetterSpacings.normal,
  },
  caption: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.sm * LineHeights.relaxed,
    letterSpacing: LetterSpacings.normal,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.xs * LineHeights.normal,
  },
});