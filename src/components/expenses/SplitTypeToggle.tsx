import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SplitType } from '../../hooks/useExpenseForm';

interface SplitTypeToggleProps {
  value: SplitType;
  onChange: (value: SplitType) => void;
  style?: ViewStyle;
}

export function SplitTypeToggle({ value, onChange, style }: SplitTypeToggleProps) {
  return (
    <View style={[styles.container, style]}>
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
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
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
    color: '#64748B',
  },
  optionTextActive: {
    color: '#1E293B',
    fontWeight: '600',
  },
});