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

type CardElevation = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  radius?: keyof typeof borderRadius;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  children,
  elevation = 'md',
  padding = 4,
  style,
  radius = 'lg',
  ...rest
}: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius[radius],
          padding: spacing[padding],
          ...shadows[elevation],
          shadowColor: colors.shadow,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default Card;