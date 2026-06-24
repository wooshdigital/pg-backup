import React from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof Theme['spacing'] | number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  variant = 'elevated',
  padding = 4,
  style,
  children,
  ...rest
}: CardProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const paddingValue =
    typeof padding === 'number' && padding > 10
      ? padding
      : theme.spacing[padding as keyof Theme['spacing']] ?? theme.spacing[4];

  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding: paddingValue },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
    },
    elevated: {
      backgroundColor: theme.colors.card,
      ...theme.shadows.md,
    },
    outlined: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filled: {
      backgroundColor: theme.colors.surfaceVariant,
    },
  });
}