import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ExpensesPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💸</Text>
      <Text style={styles.title}>Expenses Coming Soon</Text>
      <Text style={styles.subtitle}>
        In the next phase you'll be able to log shared expenses, split costs
        between participants, and see a running balance — all in one place.
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
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
});

export default ExpensesPlaceholderScreen;