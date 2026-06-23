import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  // ── Size styles ──────────────────────────────────────────────────────────

  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.md,
      },
      text: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
      },
    },
    md: {
      container: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.lg,
      },
      text: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
      },
    },
    lg: {
      container: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: 16,
        borderRadius: theme.borderRadius.lg,
      },
      text: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
      },
    },
  };

  // ── Variant styles ───────────────────────────────────────────────────────

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: isDisabled ? theme.colors.primaryLight : theme.colors.primary,
      },
      text: { color: theme.colors.textInverse },
    },
    secondary: {
      container: {
        backgroundColor: isDisabled ? theme.colors.secondaryLight : theme.colors.secondary,
      },
      text: { color: theme.colors.textInverse },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: isDisabled ? theme.colors.border : theme.colors.primary,
      },
      text: { color: isDisabled ? theme.colors.textDisabled : theme.colors.primary },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      text: { color: isDisabled ? theme.colors.textDisabled : theme.colors.primary },
    },
    danger: {
      container: {
        backgroundColor: isDisabled ? '#FCA5A5' : theme.colors.error,
      },
      text: { color: theme.colors.textInverse },
    },
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDisabled ? 0.6 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    ...sizeStyles[size].container,
    ...variantStyles[variant].container,
  };

  const labelStyle: TextStyle = {
    ...sizeStyles[size].text,
    ...variantStyles[variant].text,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[containerStyle, style]}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles[variant].text.color as string}
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={[labelStyle, textStyle]}>{label}</Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingIndicator: {
    marginHorizontal: 4,
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
});