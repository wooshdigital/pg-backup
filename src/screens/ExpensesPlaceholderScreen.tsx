import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ExpensesPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💸</Text>
      <Text style={styles.title}>Expenses Coming Soon</Text>
      <Text style={styles.subtitle}>
        Phase 4 will introduce expense tracking — add, split, and settle costs
        across trip participants.
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Phase 4 Feature</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F8F9FA',
    gap: 12,
  },
  icon: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  badge: {
    marginTop: 12,
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#6C63FF',
    fontWeight: '600',
    fontSize: 13,
  },
});