import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ExpensesPlaceholderScreenProps {
  route?: {
    params?: {
      tripId?: string;
    };
  };
}

export function ExpensesPlaceholderScreen({ route }: ExpensesPlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💸</Text>
      <Text style={styles.title}>Expenses Coming Soon</Text>
      <Text style={styles.subtitle}>
        Track shared expenses and split bills with your trip participants.
        This feature is coming in the next phase!
      </Text>
      <View style={styles.featureList}>
        <FeatureItem emoji="➕" text="Add and categorize expenses" />
        <FeatureItem emoji="🔄" text="Split costs evenly or by custom amounts" />
        <FeatureItem emoji="📊" text="See who owes what at a glance" />
        <FeatureItem emoji="✅" text="Settle up with ease" />
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
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 32,
  },
  featureList: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#3C3C43',
    fontWeight: '500',
  },
});

export default ExpensesPlaceholderScreen;