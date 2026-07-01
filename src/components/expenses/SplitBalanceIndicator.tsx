import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface SplitBalanceIndicatorProps {
  diff: number;
  currency: string;
  style?: ViewStyle;
}

function getCurrencySymbol(currency: string): string {
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    return formatted.replace(/[\d,.\s]/g, '').trim();
  } catch {
    return currency;
  }
}

export function SplitBalanceIndicator({
  diff,
  currency,
  style,
}: SplitBalanceIndicatorProps) {
  const symbol = getCurrencySymbol(currency);
  const absDiff = Math.abs(diff);
  const formatted = `${symbol}${absDiff.toFixed(2)}`;

  const isBalanced = diff === 0;
  const isOverAssigned = diff < 0;

  let label = '';
  let indicatorStyle = styles.balanced;
  let textStyle = styles.balancedText;
  let dotStyle = styles.dotBalanced;

  if (isBalanced) {
    label = 'Perfectly split ✓';
  } else if (isOverAssigned) {
    label = `${formatted} over-assigned`;
    indicatorStyle = styles.over;
    textStyle = styles.overText;
    dotStyle = styles.dotOver;
  } else {
    label = `${formatted} unassigned`;
    indicatorStyle = styles.under;
    textStyle = styles.underText;
    dotStyle = styles.dotUnder;
  }

  return (
    <View style={[styles.container, indicatorStyle, style]}>
      <View style={[styles.dot, dotStyle]} />
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  balanced: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  under: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  over: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotBalanced: {
    backgroundColor: '#22C55E',
  },
  dotUnder: {
    backgroundColor: '#F59E0B',
  },
  dotOver: {
    backgroundColor: '#EF4444',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  balancedText: {
    color: '#15803D',
  },
  underText: {
    color: '#B45309',
  },
  overText: {
    color: '#DC2626',
  },
});