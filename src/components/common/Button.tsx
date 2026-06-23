import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: TouchableOpacityProps['onPress'];
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
}

// ─── Size Config ─────────────────────────────────────────────────────────────

const sizeConfig = {
  sm: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, iconSize: 14 },
  md: { paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, iconSize: 16 },
  lg: { paddingHorizontal: 28, paddingVertical: 16, fontSize: 17, iconSize: 18 },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const config = sizeConfig[size];
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.primaryLight;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return theme.colors.textTertiary;
    switch (variant) {
      case 'primary':
        return theme.colors.textOnPrimary;
      case 'secondary':
        return theme.colors.primary;
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.textOnPrimary;
      default:
        return theme.colors.textOnPrimary;
    }
  };

  const getBorderColor = () => {
    if (isDisabled) return theme.colors.border;
    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.error;
      default:
        return 'transparent';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: config.paddingHorizontal,
          paddingVertical: config.paddingVertical,
        },
        variant === 'outline' && styles.outlined,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: config.fontSize,
                fontWeight: '600',
              },
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  text: {
    textAlign: 'center',
  },
});