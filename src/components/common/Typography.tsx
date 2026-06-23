import React from 'react';
import {
  Text,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../constants/theme';

// ─── Base Text Component ──────────────────────────────────────────────────────

interface BaseTextProps extends TextProps {
  children: React.ReactNode;
  color?: string;
  align?: TextStyle['textAlign'];
  style?: TextStyle;
}

// ─── Display ─────────────────────────────────────────────────────────────────

interface DisplayProps extends BaseTextProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Display({ children, size = 'md', color, align, style, ...rest }: DisplayProps) {
  const { colors } = useTheme();
  const fontSize = {
    sm: typography.fontSize['3xl'],
    md: typography.fontSize['4xl'],
    lg: typography.fontSize['5xl'],
  }[size];

  return (
    <Text
      style={[
        {
          fontSize,
          fontWeight: typography.fontWeight.extrabold,
          color: color ?? colors.text,
          textAlign: align,
          letterSpacing: typography.letterSpacing.tight,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Heading ─────────────────────────────────────────────────────────────────

interface HeadingProps extends BaseTextProps {
  level?: 1 | 2 | 3 | 4;
}

export function Heading({ children, level = 1, color, align, style, ...rest }: HeadingProps) {
  const { colors } = useTheme();
  const fontSizeMap = {
    1: typography.fontSize['2xl'],
    2: typography.fontSize.xl,
    3: typography.fontSize.lg,
    4: typography.fontSize.md,
  } as const;

  const fontWeightMap = {
    1: typography.fontWeight.bold,
    2: typography.fontWeight.bold,
    3: typography.fontWeight.semibold,
    4: typography.fontWeight.semibold,
  } as const;

  return (
    <Text
      style={[
        {
          fontSize: fontSizeMap[level],
          fontWeight: fontWeightMap[level],
          color: color ?? colors.text,
          textAlign: align,
          letterSpacing: level <= 2 ? typography.letterSpacing.tight : typography.letterSpacing.normal,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Body ────────────────────────────────────────────────────────────────────

interface BodyProps extends BaseTextProps {
  size?: 'sm' | 'md' | 'lg';
  weight?: 'regular' | 'medium' | 'semibold';
  secondary?: boolean;
}

export function Body({
  children,
  size = 'md',
  weight = 'regular',
  secondary = false,
  color,
  align,
  style,
  ...rest
}: BodyProps) {
  const { colors } = useTheme();
  const fontSizeMap = {
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.md,
  } as const;

  return (
    <Text
      style={[
        {
          fontSize: fontSizeMap[size],
          fontWeight: typography.fontWeight[weight],
          color: color ?? (secondary ? colors.textSecondary : colors.text),
          textAlign: align,
          lineHeight: fontSizeMap[size] * typography.lineHeight.normal,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Caption ─────────────────────────────────────────────────────────────────

interface CaptionProps extends BaseTextProps {
  weight?: 'regular' | 'medium' | 'semibold';
  uppercase?: boolean;
}

export function Caption({
  children,
  weight = 'regular',
  uppercase = false,
  color,
  align,
  style,
  ...rest
}: CaptionProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight[weight],
          color: color ?? colors.textSecondary,
          textAlign: align,
          letterSpacing: uppercase ? typography.letterSpacing.wider : typography.letterSpacing.normal,
          textTransform: uppercase ? 'uppercase' : 'none',
          lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Label ───────────────────────────────────────────────────────────────────

interface LabelProps extends BaseTextProps {
  size?: 'sm' | 'md';
  required?: boolean;
}

export function Label({ children, size = 'md', required = false, color, align, style, ...rest }: LabelProps) {
  const { colors } = useTheme();
  const fontSize = size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm;

  return (
    <Text
      style={[
        {
          fontSize,
          fontWeight: typography.fontWeight.medium,
          color: color ?? colors.textSecondary,
          textAlign: align,
          letterSpacing: typography.letterSpacing.wide,
        },
        style,
      ]}
      {...rest}
    >
      {children}
      {required && <Text style={{ color: colors.error }}>{' *'}</Text>}
    </Text>
  );
}

export default { Display, Heading, Body, Caption, Label };