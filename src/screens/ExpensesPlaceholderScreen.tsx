import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ExpensesPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💸</Text>
      <Text style={styles.title}>Expenses Coming Soon</Text>
      <Text style={styles.subtitle}>
        In Phase 4 you'll be able to split expenses, track who paid, and settle up with
        participants — all right here.
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
    backgroundColor: '#F5F5F5',
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 28,
  },
  badge: {
    backgroundColor: '#E8EAF6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#3F51B5',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});