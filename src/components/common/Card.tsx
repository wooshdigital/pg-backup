import React from 'react';
import {
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, shadows, spacing } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardElevation = 'none' | 'sm' | 'base' | 'md' | 'lg';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  radius?: keyof typeof borderRadius;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  children,
  elevation = 'base',
  padding = 4,
  style,
  radius = 'lg',
  ...rest
}: CardProps) {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: borderRadius[radius],
    padding: spacing[padding],
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows[elevation],
  };

  return (
    <View style={[styles.card, cardStyle, style]} {...rest}>
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