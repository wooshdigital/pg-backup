import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense, Participant } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  onPress: () => void;
}

export function ExpenseCard({ expense, participants, onPress }: ExpenseCardProps) {
  const participantMap = new Map(participants.map((p) => [p.id, p]));
  const payer = participantMap.get(expense.payerId);
  const payerInitials = payer ? getInitials(payer.name) : '?';
  const involvedCount = expense.splits.length;

  // Show up to 3 participant avatars
  const involvedParticipants = expense.splits
    .slice(0, 3)
    .map((s) => participantMap.get(s.participantId))
    .filter(Boolean) as Participant[];

  const extraCount = Math.max(0, involvedCount - 3);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.left}>
        <View
          style={[styles.payerAvatar, { backgroundColor: payer?.avatarColor || '#6366F1' }]}
        >
          <Text style={styles.payerInitials}>{payerInitials}</Text>
        </View>
      </View>
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {expense.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            Paid by {payer?.name || 'Unknown'}
          </Text>
          <Text style={styles.dot}> · </Text>
          <View style={styles.avatarStrip}>
            {involvedParticipants.map((p) => (
              <View
                key={p.id}
                style={[styles.miniAvatar, { backgroundColor: p.avatarColor || '#818CF8' }]}
              >
                <Text style={styles.miniAvatarText}>{getInitials(p.name)}</Text>
              </View>
            ))}
            {extraCount > 0 && (
              <View style={[styles.miniAvatar, styles.extraAvatar]}>
                <Text style={styles.miniAvatarText}>+{extraCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>
          {expense.currency} {expense.amount.toFixed(2)}
        </Text>
        <Text style={styles.splitCount}>
          {involvedCount} {involvedCount === 1 ? 'person' : 'people'}
        </Text>
      </View>
    </TouchableOpacity>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  left: {},
  payerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payerInitials: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  middle: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
  },
  dot: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  avatarStrip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  extraAvatar: {
    backgroundColor: '#9CA3AF',
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  splitCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});