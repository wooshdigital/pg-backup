import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
  disabled?: boolean;
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  children,
  variant = 'elevated',
  style,
  contentStyle,
  onPress,
  disabled = false,
  testID,
}: CardProps) {
  const { theme } = useTheme();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
    },
    variant === 'elevated' && {
      ...theme.shadows.md,
    },
    variant === 'outlined' && {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    variant === 'flat' && {
      backgroundColor: theme.colors.surfaceElevated,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});