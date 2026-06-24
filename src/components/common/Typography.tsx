import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextColor = 'primary' | 'secondary' | 'disabled' | 'inverse' | 'onPrimary' | 'error' | 'success' | 'warning';

interface BaseTypographyProps extends TextProps {
  color?: TextColor;
  align?: TextStyle['textAlign'];
  style?: TextStyle;
  children?: React.ReactNode;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveColor(color: TextColor, theme: Theme): string {
  const colorMap: Record<TextColor, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    disabled: theme.colors.textDisabled,
    inverse: theme.colors.textInverse,
    onPrimary: theme.colors.textOnPrimary,
    error: theme.colors.error,
    success: theme.colors.success,
    warning: theme.colors.warning,
  };
  return colorMap[color];
}

// ─── Display Heading ──────────────────────────────────────────────────────────

export interface DisplayProps extends BaseTypographyProps {}

export function Display({ color = 'primary', align, style, children, ...rest }: DisplayProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return (
    <Text
      style={[
        styles.display,
        { color: resolveColor(color, theme), textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Heading ─────────────────────────────────────────────────────────────────

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps extends BaseTypographyProps {
  level?: HeadingLevel;
}

export function Heading({
  level = 1,
  color = 'primary',
  align,
  style,
  children,
  ...rest
}: HeadingProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const levelStyle: Record<HeadingLevel, TextStyle> = {
    1: styles.h1,
    2: styles.h2,
    3: styles.h3,
    4: styles.h4,
  };

  return (
    <Text
      style={[
        levelStyle[level],
        { color: resolveColor(color, theme), textAlign: align },
        style,
      ]}
      accessibilityRole="header"
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

export type BodySize = 'lg' | 'md' | 'sm';

export interface BodyProps extends BaseTypographyProps {
  size?: BodySize;
  bold?: boolean;
}

export function Body({
  size = 'md',
  bold = false,
  color = 'primary',
  align,
  style,
  children,
  ...rest
}: BodyProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const sizeStyle: Record<BodySize, TextStyle> = {
    lg: styles.bodyLg,
    md: styles.bodyMd,
    sm: styles.bodySm,
  };

  return (
    <Text
      style={[
        sizeStyle[size],
        bold && styles.bold,
        { color: resolveColor(color, theme), textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Caption ─────────────────────────────────────────────────────────────────

export interface CaptionProps extends BaseTypographyProps {
  uppercase?: boolean;
}

export function Caption({
  uppercase = false,
  color = 'secondary',
  align,
  style,
  children,
  ...rest
}: CaptionProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return (
    <Text
      style={[
        styles.caption,
        uppercase && styles.uppercase,
        { color: resolveColor(color, theme), textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

export interface LabelProps extends BaseTypographyProps {
  size?: 'sm' | 'md';
}

export function Label({
  size = 'md',
  color = 'primary',
  align,
  style,
  children,
  ...rest
}: LabelProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return (
    <Text
      style={[
        size === 'sm' ? styles.labelSm : styles.labelMd,
        { color: resolveColor(color, theme), textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    display: {
      fontSize: theme.fontSizes['4xl'],
      fontWeight: theme.fontWeights.extrabold,
      letterSpacing: theme.letterSpacings.tight,
      lineHeight: theme.fontSizes['4xl'] * theme.lineHeights.tight,
    },
    h1: {
      fontSize: theme.fontSizes['3xl'],
      fontWeight: theme.fontWeights.bold,
      letterSpacing: theme.letterSpacings.tight,
      lineHeight: theme.fontSizes['3xl'] * theme.lineHeights.tight,
    },
    h2: {
      fontSize: theme.fontSizes['2xl'],
      fontWeight: theme.fontWeights.bold,
      lineHeight: theme.fontSizes['2xl'] * theme.lineHeights.tight,
    },
    h3: {
      fontSize: theme.fontSizes.xl,
      fontWeight: theme.fontWeights.semibold,
      lineHeight: theme.fontSizes.xl * theme.lineHeights.normal,
    },
    h4: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold,
      lineHeight: theme.fontSizes.lg * theme.lineHeights.normal,
    },
    bodyLg: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.regular,
      lineHeight: theme.fontSizes.lg * theme.lineHeights.normal,
    },
    bodyMd: {
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.regular,
      lineHeight: theme.fontSizes.md * theme.lineHeights.normal,
    },
    bodySm: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      lineHeight: theme.fontSizes.sm * theme.lineHeights.normal,
    },
    caption: {
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.regular,
      lineHeight: theme.fontSizes.xs * theme.lineHeights.normal,
      letterSpacing: theme.letterSpacings.wide,
    },
    labelMd: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.fontSizes.sm * theme.lineHeights.normal,
    },
    labelSm: {
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.fontSizes.xs * theme.lineHeights.normal,
    },
    bold: {
      fontWeight: theme.fontWeights.bold,
    },
    uppercase: {
      textTransform: 'uppercase',
      letterSpacing: theme.letterSpacings.wider,
    },
  });
}