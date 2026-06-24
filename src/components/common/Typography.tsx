import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { typography } from '@constants/theme';

// ─── Shared Props ─────────────────────────────────────────────────────────────

interface BaseTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  testID?: string;
}

// ─── Display ──────────────────────────────────────────────────────────────────

export function Display({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.display,
        { color: color ?? theme.colors.textPrimary, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

// ─── Headings ─────────────────────────────────────────────────────────────────

export function H1({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h1, { color: color ?? theme.colors.textPrimary, textAlign: align }, style]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

export function H2({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h2, { color: color ?? theme.colors.textPrimary, textAlign: align }, style]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

export function H3({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h3, { color: color ?? theme.colors.textPrimary, textAlign: align }, style]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

export function H4({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[styles.h4, { color: color ?? theme.colors.textPrimary, textAlign: align }, style]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

interface BodyProps extends BaseTextProps {
  size?: 'sm' | 'base' | 'lg';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export function Body({
  children,
  style,
  color,
  align,
  numberOfLines,
  size = 'base',
  weight = 'regular',
  testID,
}: BodyProps) {
  const { theme } = useTheme();

  const fontSizeMap = {
    sm: typography.fontSize.sm,
    base: typography.fontSize.base,
    lg: typography.fontSize.lg,
  };

  return (
    <Text
      style={[
        styles.body,
        {
          fontSize: fontSizeMap[size],
          fontWeight: typography.fontWeight[weight],
          color: color ?? theme.colors.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

// ─── Caption ─────────────────────────────────────────────────────────────────

export function Caption({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.caption,
        { color: color ?? theme.colors.textSecondary, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

export function Label({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.label,
        { color: color ?? theme.colors.textPrimary, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  display: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: typography.letterSpacing.tight,
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
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
  },
  h4: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  body: {
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});