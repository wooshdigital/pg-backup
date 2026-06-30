import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Participant } from '../types';
import { useTripContext } from '../context/TripContext';
import { getCurrencySymbol } from '../utils/currency';
import { getAvatarColor } from '../utils/avatarColors';

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, 'ExpenseDetail'>;
type ExpenseDetailNavProp = NativeStackNavigationProp<RootStackParamList>;

export function ExpenseDetailScreen() {
  const navigation = useNavigation<ExpenseDetailNavProp>();
  const route = useRoute<ExpenseDetailRouteProp>();
  const { tripId, expenseId } = route.params;

  const { getTripById, deleteExpense } = useTripContext();
  const trip = getTripById(tripId);
  const expense = trip?.expenses?.find(e => e.id === expenseId);

  if (!expense || !trip) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Expense not found.</Text>
      </View>
    );
  }

  const participantMap = new Map(trip.participants.map(p => [p.id, p]));
  const payer = participantMap.get(expense.payerId);
  const currencySymbol = getCurrencySymbol(expense.currency);

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Delete "${expense.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(tripId, expenseId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCreatedAt = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <Text style={styles.amount}>{expense.amount.toFixed(2)}</Text>
        </View>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.dateText}>{formatDate(expense.date)}</Text>
      </View>

      {/* Payer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paid by</Text>
        {payer && (
          <View style={styles.payerRow}>
            <ParticipantAvatar participant={payer} size={52} />
            <View style={styles.payerInfo}>
              <Text style={styles.payerName}>{payer.name}</Text>
              {payer.email ? (
                <Text style={styles.payerEmail}>{payer.email}</Text>
              ) : null}
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>
                  Paid {currencySymbol}{expense.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Split Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Split between {expense.splits.length}{' '}
          {expense.splits.length === 1 ? 'person' : 'people'}
        </Text>
        <View style={styles.splitCard}>
          {expense.splits.map((split, index) => {
            const participant = participantMap.get(split.participantId);
            if (!participant) return null;
            const isLast = index === expense.splits.length - 1;
            const isPayer = participant.id === expense.payerId;
            const owes = split.amount - (isPayer ? expense.amount : 0);

            return (
              <View
                key={split.participantId}
                style={[styles.splitRow, !isLast && styles.splitRowBorder]}
              >
                <ParticipantAvatar participant={participant} size={40} />
                <View style={styles.splitInfo}>
                  <Text style={styles.splitName}>
                    {participant.name}
                    {isPayer ? (
                      <Text style={styles.payerTag}> (payer)</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.splitOwes}>
                    {isPayer
                      ? `Paid ${currencySymbol}${expense.amount.toFixed(2)}, owes ${currencySymbol}${split.amount.toFixed(2)}`
                      : `Owes ${currencySymbol}${split.amount.toFixed(2)}`}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.splitAmount,
                    isPayer ? styles.splitAmountPayer : null,
                  ]}
                >
                  {currencySymbol}{split.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}

          <View style={styles.splitTotal}>
            <Text style={styles.splitTotalLabel}>Total</Text>
            <Text style={styles.splitTotalAmount}>
              {currencySymbol}{expense.amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Meta Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.metaCard}>
          <MetaRow label="Split Type" value={expense.splitType === 'equal' ? 'Equal split' : 'Custom split'} />
          <MetaRow label="Currency" value={expense.currency} />
          <MetaRow label="Added" value={formatCreatedAt(expense.createdAt)} isLast />
        </View>
      </View>

      {/* Delete Button */}
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>🗑️  Delete Expense</Text>
      </Pressable>
    </ScrollView>
  );
}

function ParticipantAvatar({ participant, size }: { participant: Participant; size: number }) {
  const color = participant.avatarColor || getAvatarColor(participant.name);
  const initials = participant.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          marginRight: 12,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

function MetaRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.metaRow, !isLast && styles.metaRowBorder]}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerCard: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#C7D2FE',
    marginTop: 8,
    marginRight: 2,
  },
  amount: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  payerInfo: {
    flex: 1,
  },
  payerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  payerEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  paidBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  paidBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  splitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  splitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  splitInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  payerTag: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
  splitOwes: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
  splitAmountPayer: {
    color: '#059669',
  },
  splitTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1.5,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  splitTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  splitTotalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6366F1',
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  metaRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metaLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  deleteButton: {
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});

export default ExpenseDetailScreen;