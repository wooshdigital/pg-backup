import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Participant, Split } from '../../types';

interface SplitSummaryProps {
  splits: Split[];
  participants: Participant[];
  currency: string;
}

export function SplitSummary({ splits, participants, currency }: SplitSummaryProps) {
  if (splits.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No participants selected</Text>
      </View>
    );
  }

  const participantMap = new Map(participants.map((p) => [p.id, p]));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Split Preview</Text>
      {splits.map((split) => {
        const participant = participantMap.get(split.participantId);
        if (!participant) return null;
        const initials = getInitials(participant.name);
        return (
          <View key={split.participantId} style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: participant.avatarColor || '#6366F1' },
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {participant.name}
            </Text>
            <Text style={styles.amount}>
              {currency} {split.amount.toFixed(2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  header: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});