import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
} from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  currencySymbol?: string;
  currency?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  autoFocus?: boolean;
}

export function AmountInput({
  value,
  onChangeValue,
  currencySymbol = '$',
  currency,
  placeholder = '0.00',
  label,
  error,
  autoFocus,
}: AmountInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    // Allow digits and at most one decimal point
    let cleaned = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts[1] !== undefined && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }

    onChangeValue(cleaned);
  };

  const displaySymbol = currencySymbol || currency || '$';

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        style={[styles.inputRow, error ? styles.inputRowError : null]}
        onPress={() => inputRef.current?.focus()}
      >
        <Text style={styles.symbol}>{displaySymbol}</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoFocus={autoFocus}
          returnKeyType="done"
          selectTextOnFocus
        />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputRowError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  symbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default AmountInput;