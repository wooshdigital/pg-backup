import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';

interface FABProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function FAB({
  onPress,
  icon = '+',
  label,
  style,
  accessibilityLabel = 'Add',
}: FABProps) {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.icon}>{icon}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  } as ViewStyle,
  icon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    marginTop: -2,
  } as TextStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  } as TextStyle,
});