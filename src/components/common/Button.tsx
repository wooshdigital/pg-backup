import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Body } from './Typography';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  fullWidth?: boolean;
}

// ─── Size Configs ──────────────────────────────────────────────────────────────

const sizeConfig: Record<ButtonSize, {
  paddingHorizontal: number;
  paddingVertical: number;
  fontSize: number;
  borderRadius: number;
  iconSize: number;
}> = {
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderRadius: 8,
    iconSize: 16,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 10,
    iconSize: 18,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 18,
    borderRadius: 12,
    iconSize: 20,
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const config = sizeConfig[size];

  const getButtonStyle = useCallback((): ViewStyle => {
    const base: ViewStyle = {
      paddingHorizontal: config.paddingHorizontal,
      paddingVertical: config.paddingVertical,
      borderRadius: config.borderRadius,
      opacity: disabled || loading ? 0.5 : 1,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: theme.colors.interactive.default };
      case 'secondary':
        return { ...base, backgroundColor: 'rgba(255,255,255,0.2)' };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.interactive.default,
        };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      case 'danger':
        return { ...base, backgroundColor: theme.colors.status.error };
      default:
        return { ...base, backgroundColor: theme.colors.interactive.default };
    }
  }, [variant, config, disabled, loading, fullWidth, theme]);

  const getTextColor = useCallback((): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return theme.colors.interactive.default;
      default:
        return '#FFFFFF';
    }
  }, [variant, theme]);

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getButtonStyle(), style]}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon !== undefined && (
            <View style={styles.iconLeft}>{leftIcon}</View>
          )}
          <Body
            style={[
              styles.label,
              { color: textColor, fontSize: config.fontSize },
              textStyle,
            ]}
          >
            {label}
          </Body>
          {rightIcon !== undefined && (
            <View style={styles.iconRight}>{rightIcon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});