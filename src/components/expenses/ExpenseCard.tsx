import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense, Participant } from '../../types';
import { formatAmount } from '../../utils/splitCalculator';

interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  onPress: () => void;
}

export function ExpenseCard({ expense, participants, onPress }: ExpenseCardProps) {
  const participantMap = new Map(participants.map((p) => [p.id, p]));
  const payer = participantMap.get(expense.payerId);
  const involvedParticipants = expense.splits
    .map((s) => participantMap.get(s.participantId))
    .filter(Boolean) as Participant[];

  const MAX_AVATARS = 3;
  const visibleAvatars = involvedParticipants.slice(0, MAX_AVATARS);
  const overflow = involvedParticipants.length - MAX_AVATARS;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.leftSection}>
        <Text style={styles.title} numberOfLines={1}>
          {expense.title}
        </Text>
        <View style={styles.metaRow}>
          {payer && (
            <View
              style={[
                styles.payerAvatar,
                { backgroundColor: payer.avatarColor || '#6366F1' },
              ]}
            >
              <Text style={styles.payerAvatarText}>
                {payer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.payerName}>{payer?.name || 'Unknown'}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.participantCount}>
            {involvedParticipants.length} {involvedParticipants.length === 1 ? 'person' : 'people'}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.amount}>
          {formatAmount(expense.amount, expense.currency)}
        </Text>
        <View style={styles.avatarStrip}>
          {visibleAvatars.map((p, i) => (
            <View
              key={p.id}
              style={[
                styles.stripAvatar,
                { backgroundColor: p.avatarColor || '#6366F1', marginLeft: i > 0 ? -6 : 0 },
              ]}
            >
              <Text style={styles.stripAvatarText}>
                {p.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ))}
          {overflow > 0 && (
            <View style={[styles.stripAvatar, styles.overflowAvatar, { marginLeft: -6 }]}>
              <Text style={styles.overflowText}>+{overflow}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  payerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  payerName: {
    fontSize: 13,
    color: '#6B7280',
  },
  dot: {
    marginHorizontal: 4,
    color: '#D1D5DB',
    fontSize: 13,
  },
  participantCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  avatarStrip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  stripAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 9,
  },
  overflowAvatar: {
    backgroundColor: '#E5E7EB',
  },
  overflowText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 9,
  },
});