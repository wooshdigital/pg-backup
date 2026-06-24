import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { borderRadius, shadows, spacing } from '@constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Shadow intensity level */
  elevation?: 'none' | 'sm' | 'base' | 'md' | 'lg';
  /** Horizontal + vertical padding inside the card */
  padding?: keyof typeof spacing;
  /** Whether the card has a visible border */
  bordered?: boolean;
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  elevation = 'base',
  padding = 4,
  bordered = false,
  testID,
}: CardProps): JSX.Element {
  const { theme } = useTheme();

  const shadowStyle = elevation !== 'none' ? shadows[elevation] : {};

  const dynamicStyles = {
    backgroundColor: theme.colors.cardBackground,
    borderColor: bordered ? theme.colors.border : 'transparent',
    borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
    padding: spacing[padding],
    borderRadius: borderRadius.md,
  };

  return (
    <View style={[styles.card, shadowStyle, dynamicStyles, style]} testID={testID}>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});