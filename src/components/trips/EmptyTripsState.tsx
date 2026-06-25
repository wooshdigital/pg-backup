import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyTripsStateProps {
  onCreatePress?: () => void;
}

export const EmptyTripsState: React.FC<EmptyTripsStateProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.illustration}>✈️</Text>
      <Text style={styles.title}>No trips yet</Text>
      <Text style={styles.subtitle}>
        Tap the{' '}
        <Text style={styles.highlight}>+</Text>
        {' '}button below to create your first trip and start tracking expenses together.
      </Text>
      <View style={styles.hints}>
        <View style={styles.hintRow}>
          <Text style={styles.hintIcon}>🗓️</Text>
          <Text style={styles.hintText}>Set a date range for your trip</Text>
        </View>
        <View style={styles.hintRow}>
          <Text style={styles.hintIcon}>💱</Text>
          <Text style={styles.hintText}>Choose your travel currency</Text>
        </View>
        <View style={styles.hintRow}>
          <Text style={styles.hintIcon}>👥</Text>
          <Text style={styles.hintText}>Invite friends and split expenses</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 120,
  },
  illustration: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  highlight: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 18,
  },
  hints: {
    width: '100%',
    gap: 12,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  hintIcon: {
    fontSize: 20,
  },
  hintText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});