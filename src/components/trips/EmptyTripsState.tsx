import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyTripsStateProps {
  onCreatePress?: () => void;
}

export function EmptyTripsState({ onCreatePress: _onCreatePress }: EmptyTripsStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.illustration}>✈️</Text>
      <Text style={styles.title}>No trips yet</Text>
      <Text style={styles.subtitle}>
        Start planning your next adventure!{'\n'}
        Tap the <Text style={styles.plusText}>+</Text> button below to create your first trip.
      </Text>
      <View style={styles.featureList}>
        <FeatureItem emoji="💰" text="Track shared expenses" />
        <FeatureItem emoji="👥" text="Manage group participants" />
        <FeatureItem emoji="🧾" text="Split costs fairly" />
      </View>
    </View>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  illustration: {
    fontSize: 80,
    marginBottom: 16,
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
    marginBottom: 32,
  },
  plusText: {
    fontWeight: '700',
    color: '#4F46E5',
    fontSize: 18,
  },
  featureList: {
    gap: 12,
    alignSelf: 'stretch',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
});