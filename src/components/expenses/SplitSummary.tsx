import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Participant, Split } from '../../types';
import { getAvatarColor } from '../../utils/avatarColors';

interface SplitSummaryProps {
  splits: Split[];
  participants: Participant[];
  totalAmount: number;
  currencySymbol?: string;
}

export function SplitSummary({
  splits,
  participants,
  totalAmount,
  currencySymbol = '$',
}: SplitSummaryProps) {
  const participantMap = new Map(participants.map(p => [p.id, p]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Split Preview</Text>
      <View style={styles.card}>
        {splits.map((split, index) => {
          const participant = participantMap.get(split.participantId);
          if (!participant) return null;
          const avatarColor = participant.avatarColor || getAvatarColor(participant.name);
          const initials = getInitials(participant.name);
          const percentage = totalAmount > 0 ? (split.amount / totalAmount) * 100 : 0;

          return (
            <View key={split.participantId} style={[styles.row, index > 0 && styles.rowBorder]}>
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.name}>{participant.name}</Text>
              <View style={styles.rightSide}>
                <Text style={styles.amount}>
                  {currencySymbol}{split.amount.toFixed(2)}
                </Text>
                <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
              </View>
            </View>
          );
        })}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {currencySymbol}{totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  percentage: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1.5,
    borderTopColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
});

export default SplitSummary;