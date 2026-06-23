import React from 'react';
import {
  StyleSheet,
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type CardElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  children,
  elevation = 'md',
  padding = Spacing[4],
  style,
  ...props
}: CardProps) {
  const { theme } = useTheme();

  const shadowStyle = elevation === 'none' ? {} : Shadows[elevation];

  return (
    <View
      style={[
        styles.card,
        shadowStyle,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border,
          padding,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});