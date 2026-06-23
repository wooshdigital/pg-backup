import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ─── Base Props ───────────────────────────────────────────────────────────────

interface TypographyProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  testID?: string;
  accessibilityLabel?: string;
}

// ─── Display ──────────────────────────────────────────────────────────────────

export function Display({
  children,
  style,
  color,
  align,
  numberOfLines,
  testID,
  accessibilityLabel,
}: TypographyProps) {
  const { theme } = useTheme();

  return (
    <Text
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          fontSize: theme.typography.fontSize.xxxl,
          fontWeight: theme.typography.fontWeight.bold,
          color: color ?? theme.colors.text,
          lineHeight: theme.typography.fontSize.xxxl * theme.typography.lineHeight.tight,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ─── Heading ──────────────────────────────────────────────────────────────────

interface HeadingProps extends TypographyProps {
  level?: 1 | 2 | 3 | 4;
}

export function Heading({
  children,
  style,
  color,
  align,
  numberOfLines,
  testID,
  accessibilityLabel,
  level = 1,
}: HeadingProps) {
  const { theme } = useTheme();

  const fontSizeMap = {
    1: theme.typography.fontSize.xxl,
    2: theme.typography.fontSize.xl,
    3: theme.typography.fontSize.lg,
    4: theme.typography.fontSize.md,
  };

  const fontWeightMap: Record<number, TextStyle['fontWeight']> = {
    1: theme.typography.fontWeight.bold,
    2: theme.typography.fontWeight.bold,
    3: theme.typography.fontWeight.semibold,
    4: theme.typography.fontWeight.semibold,
  };

  return (
    <Text
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
      style={[
        {
          fontSize: fontSizeMap[level],
          fontWeight: fontWeightMap[level],
          color: color ?? theme.colors.text,
          lineHeight: fontSizeMap[level] * theme.typography.lineHeight.tight,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

interface BodyProps extends TypographyProps {
  size?: 'lg' | 'md' | 'sm';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export function Body({
  children,
  style,
  color,
  align,
  numberOfLines,
  testID,
  accessibilityLabel,
  size = 'md',
  weight = 'regular',
}: BodyProps) {
  const { theme } = useTheme();

  const fontSizeMap = {
    lg: theme.typography.fontSize.lg,
    md: theme.typography.fontSize.md,
    sm: theme.typography.fontSize.sm,
  };

  return (
    <Text
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          fontSize: fontSizeMap[size],
          fontWeight: theme.typography.fontWeight[weight],
          color: color ?? theme.colors.text,
          lineHeight: fontSizeMap[size] * theme.typography.lineHeight.normal,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ─── Caption ──────────────────────────────────────────────────────────────────

interface CaptionProps extends TypographyProps {
  weight?: 'regular' | 'medium';
}

export function Caption({
  children,
  style,
  color,
  align,
  numberOfLines,
  testID,
  accessibilityLabel,
  weight = 'regular',
}: CaptionProps) {
  const { theme } = useTheme();

  return (
    <Text
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight[weight],
          color: color ?? theme.colors.textSecondary,
          lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

export function Label({
  children,
  style,
  color,
  align,
  numberOfLines,
  testID,
  accessibilityLabel,
}: TypographyProps) {
  const { theme } = useTheme();

  return (
    <Text
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: color ?? theme.colors.textSecondary,
          lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
          textAlign: align,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}