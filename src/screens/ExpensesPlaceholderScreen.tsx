import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ExpensesPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💸</Text>
      <Text style={styles.title}>Expenses Coming Soon</Text>
      <Text style={styles.subtitle}>
        Track shared expenses and split costs with your trip participants.
        This feature is coming in the next phase!
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
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ExpensesPlaceholderScreen;