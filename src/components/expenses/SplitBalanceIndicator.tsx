import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { roundCurrency } from '../../utils/splitCalculator';

interface SplitBalanceIndicatorProps {
  total: number;
  diff: number;
  currency: string;
}

export function SplitBalanceIndicator({ total, diff, currency }: SplitBalanceIndicatorProps) {
  const isOver = diff < 0;
  const isExact = diff === 0;
  const absDiff = Math.abs(roundCurrency(diff));

  if (isExact) {
    return (
      <View style={[styles.container, styles.containerSuccess]}>
        <Text style={[styles.text, styles.textSuccess]}>✓ Split is balanced</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isOver ? styles.containerError : styles.containerWarning]}>
      <Text style={[styles.text, isOver ? styles.textError : styles.textWarning]}>
        {isOver
          ? `${currency} ${absDiff.toFixed(2)} over-assigned`
          : `${currency} ${absDiff.toFixed(2)} unassigned`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  containerSuccess: {
    backgroundColor: '#E8F5E9',
  },
  containerWarning: {
    backgroundColor: '#FFF8E1',
  },
  containerError: {
    backgroundColor: '#FFEBEE',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#2E7D32',
  },
  textWarning: {
    color: '#F57F17',
  },
  textError: {
    color: '#C62828',
  },
});