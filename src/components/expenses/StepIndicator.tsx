import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number; // 0-indexed
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentStep ? styles.activeDot : styles.inactiveDot,
            index < currentStep && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: '#6366F1',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
  completedDot: {
    backgroundColor: '#818CF8',
  },
});