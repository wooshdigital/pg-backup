import React from 'react';
import {
  Text,
  TextStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ─── Base Props ────────────────────────────────────────────────────────────────

interface BaseTypographyProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  accessibilityLabel?: string;
  selectable?: boolean;
  onPress?: () => void;
}

// ─── Heading ───────────────────────────────────────────────────────────────────

interface HeadingProps extends BaseTypographyProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  style,
  numberOfLines,
  ellipsizeMode,
  accessibilityLabel,
  selectable,
  onPress,
}) => {
  const { theme } = useTheme();

  const levelStyles: Record<number, TextStyle> = {
    1: {
      fontSize: theme.fontSize.hero,
      fontWeight: theme.fontWeight.extrabold,
      lineHeight: theme.fontSize.hero * theme.lineHeight.tight,
      letterSpacing: theme.letterSpacing.tight,
      color: theme.colors.text.primary,
    },
    2: {
      fontSize: theme.fontSize.display,
      fontWeight: theme.fontWeight.bold,
      lineHeight: theme.fontSize.display * theme.lineHeight.tight,
      letterSpacing: theme.letterSpacing.tight,
      color: theme.colors.text.primary,
    },
    3: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.semibold,
      lineHeight: theme.fontSize.xxl * theme.lineHeight.normal,
      color: theme.colors.text.primary,
    },
    4: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.semibold,
      lineHeight: theme.fontSize.xl * theme.lineHeight.normal,
      color: theme.colors.text.primary,
    },
    5: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.medium,
      lineHeight: theme.fontSize.lg * theme.lineHeight.normal,
      color: theme.colors.text.primary,
    },
    6: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      lineHeight: theme.fontSize.md * theme.lineHeight.normal,
      color: theme.colors.text.primary,
    },
  };

  return (
    <Text
      style={[levelStyles[level], style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
      selectable={selectable}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

// ─── Body ──────────────────────────────────────────────────────────────────────

export const Body: React.FC<BaseTypographyProps> = ({
  children,
  style,
  numberOfLines,
  ellipsizeMode,
  accessibilityLabel,
  selectable,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.body,
        {
          fontSize: theme.fontSize.md,
          lineHeight: theme.fontSize.md * theme.lineHeight.normal,
          color: theme.colors.text.primary,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      accessibilityLabel={accessibilityLabel}
      selectable={selectable}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

// ─── Caption ───────────────────────────────────────────────────────────────────

export const Caption: React.FC<BaseTypographyProps> = ({
  children,
  style,
  numberOfLines,
  ellipsizeMode,
  accessibilityLabel,
  selectable,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        {
          fontSize: theme.fontSize.xs,
          lineHeight: theme.fontSize.xs * theme.lineHeight.normal,
          color: theme.colors.text.secondary,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      accessibilityLabel={accessibilityLabel}
      selectable={selectable}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

// ─── Label ─────────────────────────────────────────────────────────────────────

export const Label: React.FC<BaseTypographyProps> = ({
  children,
  style,
  numberOfLines,
  ellipsizeMode,
  accessibilityLabel,
  selectable,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        {
          fontSize: theme.fontSize.sm,
          lineHeight: theme.fontSize.sm * theme.lineHeight.normal,
          fontWeight: theme.fontWeight.medium,
          color: theme.colors.text.primary,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      accessibilityLabel={accessibilityLabel}
      selectable={selectable}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

// ─── Link ──────────────────────────────────────────────────────────────────────

export const Link: React.FC<BaseTypographyProps & { onPress: () => void }> = ({
  children,
  style,
  onPress,
  numberOfLines,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        {
          fontSize: theme.fontSize.md,
          lineHeight: theme.fontSize.md * theme.lineHeight.normal,
          color: theme.colors.text.link,
          textDecorationLine: 'underline',
        },
        style,
      ]}
      onPress={onPress}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="link"
    >
      {children}
    </Text>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  body: {
    fontWeight: '400',
  },
});