import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface FABProps extends TouchableOpacityProps {
  onPress: () => void;
  label?: string;
  icon?: string;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  label,
  icon = '+',
  style,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label ?? 'Floating action button'}
      {...rest}
    >
      {label ? (
        <Text style={styles.labelText}>{`${icon}  ${label}`}</Text>
      ) : (
        <Text style={styles.iconText}>{icon}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#4F6EF7',
    borderRadius: 32,
    minWidth: 56,
    height: 56,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
  labelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});