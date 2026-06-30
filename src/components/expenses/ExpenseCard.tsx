import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Expense, Participant } from '../../types';
import { getAvatarColor } from '../../utils/avatarColors';

interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  currencySymbol?: string;
  onPress?: () => void;
}

const MAX_PARTICIPANT_AVATARS = 4;

export function ExpenseCard({
  expense,
  participants,
  currencySymbol = '$',
  onPress,
}: ExpenseCardProps) {
  const participantMap = new Map(participants.map(p => [p.id, p]));
  const payer = participantMap.get(expense.payerId);
  const payerInitials = payer ? getInitials(payer.name) : '?';
  const payerColor = payer?.avatarColor || getAvatarColor(payer?.name || '');

  const involvedIds = expense.splits.map(s => s.participantId);
  const involvedParticipants = involvedIds
    .map(id => participantMap.get(id))
    .filter(Boolean) as Participant[];

  const visibleParticipants = involvedParticipants.slice(0, MAX_PARTICIPANT_AVATARS);
  const remainingCount = involvedParticipants.length - visibleParticipants.length;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      android_ripple={{ color: '#EEF2FF' }}
    >
      <View style={styles.leftSection}>
        <View style={[styles.payerAvatar, { backgroundColor: payerColor }]}>
          <Text style={styles.payerAvatarText}>{payerInitials}</Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.title} numberOfLines={1}>
          {expense.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.payerName}>
            {payer ? `Paid by ${payer.name}` : 'Unknown payer'}
          </Text>
          <Text style={styles.dot}> · </Text>
          <Text style={styles.participantCount}>
            {involvedParticipants.length} {involvedParticipants.length === 1 ? 'person' : 'people'}
          </Text>
        </View>
        <View style={styles.participantAvatars}>
          {visibleParticipants.map((p, index) => {
            const color = p.avatarColor || getAvatarColor(p.name);
            return (
              <View
                key={p.id}
                style={[
                  styles.participantAvatar,
                  { backgroundColor: color, zIndex: visibleParticipants.length - index, marginLeft: index > 0 ? -8 : 0 },
                ]}
              >
                <Text style={styles.participantAvatarText}>{getInitials(p.name)}</Text>
              </View>
            );
          })}
          {remainingCount > 0 && (
            <View style={[styles.participantAvatar, styles.participantAvatarExtra, { marginLeft: -8 }]}>
              <Text style={styles.participantAvatarExtraText}>+{remainingCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.amount}>
          {currencySymbol}{expense.amount.toFixed(2)}
        </Text>
      </View>
    </Pressable>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    backgroundColor: '#F5F3FF',
  },
  leftSection: {
    marginRight: 12,
  },
  payerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payerAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  middleSection: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerName: {
    fontSize: 12,
    color: '#6B7280',
  },
  dot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  participantCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  participantAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  participantAvatarText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  participantAvatarExtra: {
    backgroundColor: '#9CA3AF',
  },
  participantAvatarExtraText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  rightSection: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6366F1',
  },
});

export default ExpenseCard;