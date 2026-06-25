import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyTripsStateProps {
  onCreateTrip: () => void;
}

export const EmptyTripsState: React.FC<EmptyTripsStateProps> = ({ onCreateTrip }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.illustration}>🗺️</Text>
      <Text style={styles.title}>No trips yet</Text>
      <Text style={styles.subtitle}>
        Start planning your next adventure!{'\n'}Create a trip to track shared expenses.
      </Text>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onCreateTrip}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>+ Create your first trip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  illustration: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: '#4F6EF7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#4F6EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});