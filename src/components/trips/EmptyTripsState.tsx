import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface EmptyTripsStateProps {
  onCreateTrip?: () => void;
}

export function EmptyTripsState({ onCreateTrip }: EmptyTripsStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.illustration}>✈️</Text>
      <Text style={styles.title}>No trips yet</Text>
      <Text style={styles.subtitle}>
        Tap the{' '}
        <Text style={styles.highlight}>+</Text>
        {' '}button below to plan your first adventure and start splitting expenses with friends.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  } as ViewStyle,
  illustration: {
    fontSize: 72,
    marginBottom: 24,
  } as TextStyle,
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,
  highlight: {
    color: '#6366F1',
    fontWeight: '700',
  } as TextStyle,
});