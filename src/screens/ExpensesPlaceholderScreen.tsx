import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This screen is used as a placeholder when tripId is not available
export function ExpensesPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No trip selected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ExpensesPlaceholderScreen;