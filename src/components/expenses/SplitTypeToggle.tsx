import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

export type SplitType = 'equal' | 'custom';

interface SplitTypeToggleProps {
  value: SplitType;
  onChange: (value: SplitType) => void;
  style?: ViewStyle;
}

export const SplitTypeToggle: React.FC<SplitTypeToggleProps> = ({
  value,
  onChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.option, value === 'equal' && styles.optionActive]}
        onPress={() => onChange('equal')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            value === 'equal' && styles.optionTextActive,
          ]}
        >
          Equal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, value === 'custom' && styles.optionActive]}
        onPress={() => onChange('custom')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            value === 'custom' && styles.optionTextActive,
          ]}
        >
          Custom
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F5',
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
    color: '#8E8E93',
  },
  optionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});