import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** If provided, card becomes pressable */
  onPress?: () => void;
  /** Elevation level (1-4), defaults to 1 */
  elevation?: 1 | 2 | 3 | 4;
  /** Disable internal padding */
  noPadding?: boolean;
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  onPress,
  elevation = 1,
  noPadding = false,
  testID,
}: CardProps) {
  const { theme } = useTheme();

  const shadowOpacity = {
    1: 0.06,
    2: 0.1,
    3: 0.14,
    4: 0.18,
  }[elevation];

  const shadowRadius = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
  }[elevation];

  const elevationValue = {
    1: 2,
    2: 4,
    3: 6,
    4: 8,
  }[elevation];

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: noPadding ? 0 : theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity,
    shadowRadius,
    elevation: elevationValue,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[cardStyle, style]}
        testID={testID}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]} testID={testID}>
      {children}
    </View>
  );
}