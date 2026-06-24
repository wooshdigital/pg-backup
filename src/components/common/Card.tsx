import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Shadows } from '../../constants/theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CardElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  style?: StyleProp<ViewStyle>;
  /** Override background color */
  backgroundColor?: string;
  /** Remove default padding */
  noPadding?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'md',
  style,
  backgroundColor,
  noPadding = false,
}) => {
  const { theme } = useTheme();

  const shadowStyle = elevation !== 'none' ? Shadows[elevation] : {};

  return (
    <View
      style={[
        styles.card,
        shadowStyle,
        {
          backgroundColor: backgroundColor ?? theme.colors.surface.primary,
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.borderRadius.lg,
          padding: noPadding ? 0 : theme.spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});