import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, typography } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ─── Size Config ─────────────────────────────────────────────────────────────

const sizeConfig = {
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSize.sm,
    borderRadius: borderRadius.md,
    iconSize: 14,
  },
  md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.lg,
    iconSize: 16,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    fontSize: typography.fontSize.md,
    borderRadius: borderRadius.xl,
    iconSize: 20,
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const config = sizeConfig[size];
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, colors, isDisabled);

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: config.borderRadius,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          ...variantStyles.container,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.label,
              {
                fontSize: config.fontSize,
                color: variantStyles.textColor,
                marginLeft: leftIcon ? spacing[2] : 0,
                marginRight: rightIcon ? spacing[2] : 0,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

// ─── Variant Styles Helper ───────────────────────────────────────────────────

function getVariantStyles(
  variant: ButtonVariant,
  colors: ReturnType<typeof useTheme>['colors'],
  _isDisabled: boolean,
): { container: ViewStyle; textColor: string } {
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: colors.primary,
          borderWidth: 0,
        },
        textColor: colors.textInverse,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.secondary,
          borderWidth: 0,
        },
        textColor: colors.textInverse,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        textColor: colors.primary,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
        textColor: colors.primary,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: colors.error,
          borderWidth: 0,
        },
        textColor: colors.textInverse,
      };
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
});

export default Button;