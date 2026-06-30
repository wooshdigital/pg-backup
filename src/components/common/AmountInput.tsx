import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { getCurrencySymbol } from '../../utils/splitCalculator';

interface AmountInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  value: string;
  onChangeText: (value: string) => void;
  currency: string;
  label?: string;
  error?: string;
}

export function AmountInput({
  value,
  onChangeText,
  currency,
  label,
  error,
  ...rest
}: AmountInputProps) {
  const [focused, setFocused] = useState(false);
  const symbol = getCurrencySymbol(currency);

  const handleChangeText = (text: string) => {
    // Allow only digits and single decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple dots
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    // Limit to 2 decimal places
    if (parts[1] !== undefined && parts[1].length > 2) return;
    onChangeText(cleaned);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          error ? styles.inputContainerError : null,
        ]}
      >
        <Text style={styles.symbol}>{symbol}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    padding: 0,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: '#EF4444',
  },
});