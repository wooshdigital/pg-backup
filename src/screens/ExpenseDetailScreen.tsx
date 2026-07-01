import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTrip } from '../context/TripContext';
import { roundCurrency } from '../utils/splitCalculator';

interface RouteParams {
  tripId: string;
  expenseId: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#3B82F6', '#14B8A6',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tripId, expenseId } = route.params as RouteParams;

  const { state, dispatch } = useTrip();
  const trip = state.trips.find((t: any) => t.id === tripId);
  const expense = trip?.expenses?.find((e: any) => e.id === expenseId);
  const participants = trip?.participants || [];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.editButton}
          accessibilityLabel="Edit expense"
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, tripId, expenseId]);

  const handleEdit = () => {
    navigation.navigate('AddExpense', { tripId, expenseId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense?.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'TRIP_REMOVE_EXPENSE',
              payload: { tripId, expenseId },
            });
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!expense) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Expense not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currSymbol = getCurrencySymbol(expense.currency || 'USD');
  const paidBy = participants.find((p: any) => p.id === expense.paidById);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Amount header */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>{expense.description}</Text>
        <Text style={styles.amountValue}>
          {currSymbol}{roundCurrency(expense.amount).toFixed(2)}
        </Text>
        {expense.date && (
          <Text style={styles.dateText}>{expense.date}</Text>
        )}
        {expense.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{expense.category}</Text>
          </View>
        )}
      </View>

      {/* Paid by */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paid by</Text>
        {paidBy ? (
          <View style={styles.paidByRow}>
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(paidBy.name) }]}>
              <Text style={styles.avatarText}>{getInitials(paidBy.name)}</Text>
            </View>
            <Text style={styles.paidByName}>{paidBy.name}</Text>
          </View>
        ) : (
          <Text style={styles.unknownText}>Unknown</Text>
        )}
      </View>

      {/* Split breakdown */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Split</Text>
          {expense.splitType && (
            <View style={styles.splitTypeBadge}>
              <Text style={styles.splitTypeBadgeText}>
                {expense.splitType === 'custom' ? 'Custom' : 'Equal'}
              </Text>
            </View>
          )}
        </View>
        {expense.splits?.map((split: any) => {
          const participant = participants.find((p: any) => p.id === split.participantId);
          if (!participant) return null;
          const percentage = expense.amount > 0
            ? ((split.amount / expense.amount) * 100).toFixed(1)
            : '0.0';
          return (
            <View key={split.participantId} style={styles.splitRow}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(participant.name) }]}>
                <Text style={styles.avatarText}>{getInitials(participant.name)}</Text>
              </View>
              <Text style={styles.splitName}>{participant.name}</Text>
              <View style={styles.splitAmounts}>
                <Text style={styles.splitAmount}>
                  {currSymbol}{roundCurrency(split.amount).toFixed(2)}
                </Text>
                <Text style={styles.splitPercent}>{percentage}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Notes */}
      {expense.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{expense.notes}</Text>
        </View>
      ) : null}

      {/* Metadata */}
      <View style={styles.section}>
        <Text style={styles.metaText}>
          Added {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : 'unknown'}
        </Text>
        {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
          <Text style={styles.metaText}>
            Edited {new Date(expense.updatedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Delete */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editButton: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  editButtonText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 15,
  },
  amountCard: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  amountLabel: {
    fontSize: 18,
    color: '#C7D2FE',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -1,
  },
  dateText: {
    fontSize: 14,
    color: '#A5B4FC',
    marginTop: 4,
  },
  categoryBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  splitTypeBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  splitTypeBadgeText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  paidByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paidByName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  unknownText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  splitName: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  splitAmounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  splitPercent: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notesText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  metaText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  deleteButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default ExpenseDetailScreen;