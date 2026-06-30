import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Participant, Split } from '../../types';
import { formatAmount } from '../../utils/splitCalculator';

interface SplitSummaryProps {
  splits: Split[];
  participants: Participant[];
  currency: string;
  totalAmount: number;
}

export function SplitSummary({ splits, participants, currency, totalAmount }: SplitSummaryProps) {
  const participantMap = new Map(participants.map((p) => [p.id, p]));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Split Preview</Text>
      <View style={styles.card}>
        {splits.map((split, index) => {
          const participant = participantMap.get(split.participantId);
          if (!participant) return null;
          return (
            <View
              key={split.participantId}
              style={[styles.row, index < splits.length - 1 && styles.rowBorder]}
            >
              <View style={[styles.avatar, { backgroundColor: participant.avatarColor || '#6366F1' }]}>
                <Text style={styles.avatarText}>
                  {participant.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.name}>{participant.name}</Text>
              <Text style={styles.amount}>{formatAmount(split.amount, currency)}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.totalNote}>
        Total: {formatAmount(totalAmount, currency)} ÷ {splits.length} people
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
  totalNote: {
    marginTop: 8,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});