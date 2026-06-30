import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={[
                styles.dot,
                index < currentStep ? styles.dotCompleted : null,
                index === currentStep ? styles.dotActive : null,
              ]}
            >
              {index < currentStep ? (
                <Text style={styles.dotCheck}>✓</Text>
              ) : (
                <Text style={[styles.dotNumber, index === currentStep ? styles.dotNumberActive : null]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View style={[styles.line, index < currentStep ? styles.lineCompleted : null]} />
            )}
          </React.Fragment>
        ))}
      </View>
      {stepLabels && stepLabels[currentStep] ? (
        <Text style={styles.stepLabel}>{stepLabels[currentStep]}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
  },
  dotCompleted: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
  },
  dotNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dotNumberActive: {
    color: '#FFFFFF',
  },
  dotCheck: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  line: {
    width: 40,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  lineCompleted: {
    backgroundColor: '#6366F1',
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
});

export default StepIndicator;