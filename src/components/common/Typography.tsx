import React from 'react';
import { type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BaseTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  testID?: string;
}

// ─── Heading ─────────────────────────────────────────────────────────────────

interface HeadingProps extends BaseTextProps {
  level?: 1 | 2 | 3 | 4;
}

export function Heading({ children, level = 1, style, color, align, numberOfLines, testID }: HeadingProps) {
  const { theme } = useTheme();

  const sizeMap = {
    1: theme.fontSizes['4xl'],
    2: theme.fontSizes['3xl'],
    3: theme.fontSizes['2xl'],
    4: theme.fontSizes.xl,
  };

  return (
    <Text
      style={[
        styles.heading,
        {
          fontSize: sizeMap[level],
          color: color ?? theme.colors.textPrimary,
          textAlign: align ?? 'left',
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

// ─── Subheading ───────────────────────────────────────────────────────────────

export function Subheading({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.subheading,
        {
          fontSize: theme.fontSizes.lg,
          color: color ?? theme.colors.textPrimary,
          textAlign: align ?? 'left',
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

// ─── Body ─────────────────────────────────────────────────────────────────────

interface BodyProps extends BaseTextProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Body({ children, size = 'md', style, color, align, numberOfLines, testID }: BodyProps) {
  const { theme } = useTheme();

  const sizeMap = {
    sm: theme.fontSizes.sm,
    md: theme.fontSizes.md,
    lg: theme.fontSizes.lg,
  };

  return (
    <Text
      style={[
        styles.body,
        {
          fontSize: sizeMap[size],
          color: color ?? theme.colors.textPrimary,
          textAlign: align ?? 'left',
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

// ─── Label ────────────────────────────────────────────────────────────────────

export function Label({ children, style, color, align, numberOfLines, testID }: BaseTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.label,
        {
          fontSize: theme.fontSizes.sm,
          color: color ?? theme.colors.textSecondary,
          textAlign: align ?? 'left',
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
        {
          fontSize: theme.fontSizes.xs,
          color: color ?? theme.colors.textTertiary,
          textAlign: align ?? 'left',
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subheading: {
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  body: {
    fontWeight: '400',
    lineHeight: 22,
  },
  label: {
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  caption: {
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});