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

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon = '+',
  label,
  style,
  accessibilityLabel = 'Floating action button',
}) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={styles.icon}>{icon}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,
  icon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    fontWeight: '400',
  } as TextStyle,
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  } as TextStyle,
});