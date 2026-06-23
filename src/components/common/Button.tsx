import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from '../../constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
  sm: {
    paddingVertical: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    fontSize: FontSizes.sm,
    borderRadius: BorderRadius.md,
  },
  md: {
    paddingVertical: Spacing[2.5],
    paddingHorizontal: Spacing[5],
    fontSize: FontSizes.base,
    borderRadius: BorderRadius.lg,
  },
  lg: {
    paddingVertical: Spacing[3.5],
    paddingHorizontal: Spacing[7],
    fontSize: FontSizes.lg,
    borderRadius: BorderRadius.xl,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
  const sizeConfig = sizeStyles[size];
  const isDisabled = disabled || loading;

  // Compute background and text colors based on variant
  const getVariantStyles = (): { bg: string; text: string; borderColor?: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: isDisabled ? theme.colors.primaryLight : theme.colors.primary,
          text: theme.colors.textInverse,
        };
      case 'secondary':
        return {
          bg: theme.colors.surfaceVariant,
          text: theme.colors.textPrimary,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: theme.colors.primary,
        };
      case 'danger':
        return {
          bg: isDisabled ? theme.colors.error + '80' : theme.colors.error,
          text: theme.colors.textInverse,
        };
      default:
        return {
          bg: theme.colors.primary,
          text: theme.colors.textInverse,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: variantStyles.bg,
          borderRadius: sizeConfig.borderRadius,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variantStyles.borderColor ?? 'transparent',
          opacity: isDisabled && !loading ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: variantStyles.text,
              fontSize: sizeConfig.fontSize,
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: 64,
  },
  label: {
    fontWeight: FontWeights.semiBold,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});