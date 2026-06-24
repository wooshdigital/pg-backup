import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TextStyle,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, typography } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'base' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ─── Size Config ──────────────────────────────────────────────────────────────

const sizeConfig = {
  sm: {
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSize.sm,
    borderRadius: borderRadius.base,
    minHeight: 32,
  },
  base: {
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[5],
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.md,
    minHeight: 44,
  },
  lg: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    fontSize: typography.fontSize.md,
    borderRadius: borderRadius.lg,
    minHeight: 52,
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  label,
  variant = 'primary',
  size = 'base',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  onPress,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme();
  const config = sizeConfig[size];
  const isDisabled = disabled ?? loading;

  const getVariantStyles = useCallback((): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.primaryLight : theme.primary,
          },
          text: { color: theme.primaryForeground },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.border : theme.secondary,
          },
          text: { color: theme.secondaryForeground },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? theme.border : theme.primary,
          },
          text: { color: isDisabled ? theme.textDisabled : theme.primary },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: isDisabled ? theme.textDisabled : theme.primary },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? theme.dangerLight : theme.danger,
          },
          text: { color: theme.dangerForeground },
        };
    }
  }, [variant, isDisabled, theme]);

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    borderRadius: config.borderRadius,
    paddingVertical: config.paddingVertical,
    paddingHorizontal: config.paddingHorizontal,
    minHeight: config.minHeight,
    opacity: isDisabled ? 0.6 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    ...variantStyles.container,
  };

  const labelStyle: TextStyle = {
    fontSize: config.fontSize,
    fontWeight: typography.fontWeight.semiBold,
    ...variantStyles.text,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.container, containerStyle, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, labelStyle, textStyle]}>{label}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    textAlign: 'center',
  },
});