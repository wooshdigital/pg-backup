import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface AmountInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (value: string) => void;
  currencySymbol?: string;
  label?: string;
  error?: string;
}

export function AmountInput({
  value,
  onChangeText,
  currencySymbol = '$',
  label,
  error,
  ...rest
}: AmountInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    // Allow only numbers and a single decimal point with up to 2 decimal places
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return; // More than one decimal point
    if (parts[1] !== undefined && parts[1].length > 2) return; // More than 2 decimals
    onChangeText(cleaned);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        <Text style={styles.symbol}>{currencySymbol}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#fff',
  },
  inputRowError: {
    borderColor: '#EF4444',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
});