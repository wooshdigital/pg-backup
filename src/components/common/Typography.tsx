import React from 'react';
import {
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BaseTextProps extends TextProps {
  children: React.ReactNode;
  color?: string;
  align?: TextStyle['textAlign'];
  style?: TextStyle;
}

// ─── Display ──────────────────────────────────────────────────────────────────

export function Display({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.display,
        { color: color ?? theme.textPrimary, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Headings ─────────────────────────────────────────────────────────────────

export function H1({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h1, { color: color ?? theme.textPrimary, textAlign: align }, style]}
      accessibilityRole="header"
      {...rest}
    >
      {children}
    </Text>
  );
}

export function H2({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h2, { color: color ?? theme.textPrimary, textAlign: align }, style]}
      accessibilityRole="header"
      {...rest}
    >
      {children}
    </Text>
  );
}

export function H3({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h3, { color: color ?? theme.textPrimary, textAlign: align }, style]}
      accessibilityRole="header"
      {...rest}
    >
      {children}
    </Text>
  );
}

export function H4({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h4, { color: color ?? theme.textPrimary, textAlign: align }, style]}
      accessibilityRole="header"
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Body Text ────────────────────────────────────────────────────────────────

export function BodyLarge({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.bodyLarge, { color: color ?? theme.textPrimary, textAlign: align }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Body({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.body, { color: color ?? theme.textPrimary, textAlign: align }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function BodySmall({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.bodySmall,
        { color: color ?? theme.textSecondary, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Captions & Labels ────────────────────────────────────────────────────────

export function Caption({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.caption,
        { color: color ?? theme.textSecondary, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Label({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.label,
        { color: color ?? theme.textSecondary, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Overline({ children, color, align, style, ...rest }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.overline,
        { color: color ?? theme.textTertiary, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  display: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extraBold,
    letterSpacing: typography.letterSpacing.tighter,
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
  },
  h1: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.snug,
  },
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.fontSize.xl * typography.lineHeight.snug,
  },
  h4: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    letterSpacing: typography.letterSpacing.wide,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  overline: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    letterSpacing: typography.letterSpacing.widest,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    textTransform: 'uppercase',
  },
});