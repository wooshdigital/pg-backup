import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type SplitType = 'equal' | 'custom';

interface SplitTypeToggleProps {
  value: SplitType;
  onChange: (value: SplitType) => void;
}

export const SplitTypeToggle: React.FC<SplitTypeToggleProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Split Type</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.option, value === 'equal' && styles.optionActive]}
          onPress={() => onChange('equal')}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, value === 'equal' && styles.optionTextActive]}>
            Equal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, value === 'custom' && styles.optionActive]}
          onPress={() => onChange('custom')}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, value === 'custom' && styles.optionTextActive]}>
            Custom
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
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