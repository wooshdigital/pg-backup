import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type SplitType = 'equal' | 'custom';

interface SplitTypeToggleProps {
  value: SplitType;
  onChange: (type: SplitType) => void;
}

export const SplitTypeToggle: React.FC<SplitTypeToggleProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, value === 'equal' && styles.optionActive]}
        onPress={() => onChange('equal')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'equal' }}
      >
        <Text style={[styles.optionText, value === 'equal' && styles.optionTextActive]}>
          Equal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, value === 'custom' && styles.optionActive]}
        onPress={() => onChange('custom')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'custom' }}
      >
        <Text style={[styles.optionText, value === 'custom' && styles.optionTextActive]}>
          Custom
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
});

export default SplitTypeToggle;