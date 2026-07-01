import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { roundCurrency } from '../../utils/splitCalculator';

interface SplitBalanceIndicatorProps {
  total: number;
  assigned: number;
  currency?: string;
}

export const SplitBalanceIndicator: React.FC<SplitBalanceIndicatorProps> = ({
  total,
  assigned,
  currency = '$',
}) => {
  const remaining = roundCurrency(total - assigned);
  const isOver = remaining < -0.001;
  const isExact = Math.abs(remaining) < 0.001;

  return (
    <View style={[styles.container, isOver && styles.containerOver, isExact && styles.containerExact]}>
      <Text style={[styles.label, isOver && styles.labelOver, isExact && styles.labelExact]}>
        {isExact
          ? '✓ Splits balanced'
          : isOver
          ? `${currency}${Math.abs(remaining).toFixed(2)} over-assigned`
          : `${currency}${remaining.toFixed(2)} unassigned`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    marginVertical: 8,
  },
  containerOver: {
    backgroundColor: '#FEE2E2',
  },
  containerExact: {
    backgroundColor: '#DCFCE7',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  labelOver: {
    color: '#991B1B',
  },
  labelExact: {
    color: '#166534',
  },
});

export default SplitBalanceIndicator;