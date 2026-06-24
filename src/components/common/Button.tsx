import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'base' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizeMap = {
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSize.sm,
    iconSize: 16,
    minHeight: 34,
  },
  base: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: typography.fontSize.base,
    iconSize: 18,
    minHeight: 44,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    fontSize: typography.fontSize.lg,
    iconSize: 20,
    minHeight: 52,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  label,
  variant = 'primary',
  size = 'base',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  testID,
  onPress,
  ...rest
}: ButtonProps): JSX.Element {
  const { theme } = useTheme();
  const sizeTokens = sizeMap[size];
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.primaryLight : theme.colors.primary,
            ...shadows.sm,
          },
          text: { color: theme.colors.textInverse },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled
              ? theme.colors.surfaceSecondary
              : theme.colors.primaryLight,
          },
          text: { color: isDisabled ? theme.colors.textDisabled : theme.colors.primary },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? theme.colors.border : theme.colors.primary,
          },
          text: { color: isDisabled ? theme.colors.textDisabled : theme.colors.primary },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: isDisabled ? theme.colors.textDisabled : theme.colors.primary },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.dangerLight : theme.colors.danger,
            ...shadows.sm,
          },
          text: { color: theme.colors.textInverse },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessible
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: sizeTokens.paddingVertical,
          paddingHorizontal: sizeTokens.paddingHorizontal,
          minHeight: sizeTokens.minHeight,
          borderRadius: borderRadius.base,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: pressed && !isDisabled ? 0.8 : 1,
        },
        variantStyles.container,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#fff' : theme.colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.label,
              {
                fontSize: sizeTokens.fontSize,
                fontWeight: typography.fontWeight.semibold,
              },
              variantStyles.text,
            ]}
          >
            {label}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
});