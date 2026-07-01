import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getUnassignedAmount } from '../../utils/splitCalculator';
import type { Split } from '../../utils/splitCalculator';

interface SplitBalanceIndicatorProps {
  splits: Split[];
  total: number;
  currency: string;
}

export const SplitBalanceIndicator: React.FC<SplitBalanceIndicatorProps> = ({
  splits,
  total,
  currency,
}) => {
  const unassigned = getUnassignedAmount(splits, total);
  const isBalanced = Math.abs(unassigned) < 0.001;
  const isOver = unassigned < -0.001;

  const bgColor = isBalanced ? '#ECFDF5' : isOver ? '#FEF2F2' : '#FFFBEB';
  const textColor = isBalanced ? '#065F46' : isOver ? '#991B1B' : '#92400E';
  const borderColor = isBalanced ? '#6EE7B7' : isOver ? '#FCA5A5' : '#FCD34D';

  let message: string;
  if (isBalanced) {
    message = 'Perfectly split ✓';
  } else if (isOver) {
    message = `${Math.abs(unassigned).toFixed(2)} ${currency} over-assigned`;
  } else {
    message = `${unassigned.toFixed(2)} ${currency} unassigned`;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});