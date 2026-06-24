import React from 'react';
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
import type { Theme } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

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

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.textOnPrimary
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.label,
              styles[`labelSize_${size}`],
              styles[`labelVariant_${variant}`],
              isDisabled && styles.labelDisabled,
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      borderRadius: theme.radii.md,
    },
    // Sizes
    size_sm: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[1.5],
      minHeight: 32,
    },
    size_md: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2.5],
      minHeight: 44,
    },
    size_lg: {
      paddingHorizontal: theme.spacing[6],
      paddingVertical: theme.spacing[3],
      minHeight: 52,
    },
    // Variants
    variant_primary: {
      backgroundColor: theme.colors.primary,
    },
    variant_secondary: {
      backgroundColor: theme.colors.primaryLight,
    },
    variant_outline: {
      backgroundColor: theme.colors.transparent,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    variant_ghost: {
      backgroundColor: theme.colors.transparent,
    },
    variant_destructive: {
      backgroundColor: theme.colors.error,
    },
    // States
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
    // Labels
    label: {
      fontWeight: theme.fontWeights.semibold,
    },
    labelSize_sm: {
      fontSize: theme.fontSizes.sm,
    },
    labelSize_md: {
      fontSize: theme.fontSizes.md,
    },
    labelSize_lg: {
      fontSize: theme.fontSizes.lg,
    },
    labelVariant_primary: {
      color: theme.colors.textOnPrimary,
    },
    labelVariant_secondary: {
      color: theme.colors.primary,
    },
    labelVariant_outline: {
      color: theme.colors.primary,
    },
    labelVariant_ghost: {
      color: theme.colors.primary,
    },
    labelVariant_destructive: {
      color: theme.colors.textOnPrimary,
    },
    labelDisabled: {
      opacity: 0.7,
    },
  });
}