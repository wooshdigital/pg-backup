import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface SplitBalanceIndicatorProps {
  diff: number;
  currencySymbol?: string;
  style?: ViewStyle;
}

export const SplitBalanceIndicator: React.FC<SplitBalanceIndicatorProps> = ({
  diff,
  currencySymbol = '$',
  style,
}) => {
  const isBalanced = diff === 0;
  const isOver = diff < 0;

  const absVal = Math.abs(diff).toFixed(2);

  let message: string;
  if (isBalanced) {
    message = 'Splits are balanced ✓';
  } else if (isOver) {
    message = `${currencySymbol}${absVal} over-assigned`;
  } else {
    message = `${currencySymbol}${absVal} unassigned`;
  }

  return (
    <View
      style={[
        styles.container,
        isBalanced && styles.containerBalanced,
        isOver && styles.containerOver,
      ]}
    >
      <Text
        style={[
          styles.text,
          isBalanced && styles.textBalanced,
          isOver && styles.textOver,
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  containerBalanced: {
    backgroundColor: '#E8F5E9',
  },
  containerOver: {
    backgroundColor: '#FFEBEE',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
  },
  textBalanced: {
    color: '#2E7D32',
  },
  textOver: {
    color: '#C62828',
  },
});