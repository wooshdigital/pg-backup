import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ExpensesPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💸</Text>
      <Text style={styles.title}>Expenses Coming Soon</Text>
      <Text style={styles.subtitle}>
        Phase 4 will bring full expense tracking, splitting, and settlement features.
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Phase 4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 32,
    gap: 12,
  },
  icon: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default ExpensesPlaceholderScreen;