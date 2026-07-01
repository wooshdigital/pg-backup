import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SplitType } from '../../hooks/useExpenseForm';

interface SplitTypeToggleProps {
  value: SplitType;
  onChange: (value: SplitType) => void;
}

export function SplitTypeToggle({ value, onChange }: SplitTypeToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, value === 'equal' && styles.optionActive]}
        onPress={() => onChange('equal')}
        accessibilityRole="radio"
        accessibilityState={{ checked: value === 'equal' }}
        accessibilityLabel="Equal split"
      >
        <Text style={[styles.optionText, value === 'equal' && styles.optionTextActive]}>
          Equal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, value === 'custom' && styles.optionActive]}
        onPress={() => onChange('custom')}
        accessibilityRole="radio"
        accessibilityState={{ checked: value === 'custom' }}
        accessibilityLabel="Custom split"
      >
        <Text style={[styles.optionText, value === 'custom' && styles.optionTextActive]}>
          Custom
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
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
    color: '#666',
  },
  optionTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
});