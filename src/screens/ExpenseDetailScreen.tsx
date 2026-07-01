import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TripContext } from '../context/TripContext';
import { getAvatarColor } from '../utils/avatarColors';
import { formatCurrency } from '../utils/currency';

type ExpenseDetailRouteParams = {
  ExpenseDetail: {
    tripId: string;
    expenseId: string;
  };
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ExpenseDetailRouteParams, 'ExpenseDetail'>>();
  const { tripId, expenseId } = route.params;

  const { state, dispatch } = useContext(TripContext);
  const trip = state.trips.find(t => t.id === tripId);
  const expense = trip?.expenses?.find(e => e.id === expenseId);

  const participants = useMemo(() => trip?.participants ?? [], [trip]);

  const getParticipantName = (id: string): string => {
    return participants.find(p => p.id === id)?.name ?? 'Unknown';
  };

  const handleEdit = () => {
    navigation.navigate('AddExpense', {
      tripId,
      expenseId,
    });
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
              type: 'TRIP_DELETE_EXPENSE',
              payload: { tripId, expenseId },
            });
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!expense || !trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Expense not found</Text>
      </View>
    );
  }

  const paidByName = getParticipantName(expense.paidBy);
  const paidByColor = getAvatarColor(expense.paidBy);
  const currency = expense.currency ?? trip.currency ?? 'USD';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Expense Details
        </Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.expenseDescription}>{expense.description}</Text>
          <Text style={styles.expenseAmount}>
            {currency} {expense.amount.toFixed(2)}
          </Text>
          <View style={styles.paidByRow}>
            <View style={[styles.paidByAvatar, { backgroundColor: paidByColor }]}>
              <Text style={styles.paidByAvatarText}>{getInitials(paidByName)}</Text>
            </View>
            <Text style={styles.paidByText}>
              Paid by <Text style={styles.paidByName}>{paidByName}</Text>
            </Text>
          </View>
          {expense.createdAt && (
            <Text style={styles.dateText}>
              {new Date(expense.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          )}
        </View>

        {/* Splits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split Breakdown</Text>
          {expense.splits && expense.splits.length > 0 ? (
            expense.splits.map(split => {
              const name = getParticipantName(split.participantId);
              const color = getAvatarColor(split.participantId);
              const percentage = expense.amount > 0
                ? ((split.amount / expense.amount) * 100).toFixed(0)
                : '0';
              const isOwed = split.participantId !== expense.paidBy;

              return (
                <View key={split.participantId} style={styles.splitRow}>
                  <View style={[styles.splitAvatar, { backgroundColor: color }]}>
                    <Text style={styles.splitAvatarText}>{getInitials(name)}</Text>
                  </View>
                  <View style={styles.splitInfo}>
                    <Text style={styles.splitName}>{name}</Text>
                    <Text style={styles.splitPercentage}>{percentage}% of total</Text>
                  </View>
                  <View style={styles.splitAmountContainer}>
                    <Text style={styles.splitAmount}>
                      {currency} {split.amount.toFixed(2)}
                    </Text>
                    {isOwed && (
                      <Text style={styles.splitOwed}>owes {paidByName.split(' ')[0]}</Text>
                    )}
                    {!isOwed && (
                      <Text style={styles.splitPaid}>paid</Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No split information available</Text>
          )}
        </View>

        {/* Summary */}
        {expense.splits && expense.splits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What people owe {paidByName.split(' ')[0]}</Text>
            {expense.splits
              .filter(s => s.participantId !== expense.paidBy)
              .map(split => {
                const name = getParticipantName(split.participantId);
                const color = getAvatarColor(split.participantId);
                return (
                  <View key={split.participantId} style={styles.oweRow}>
                    <View style={[styles.oweAvatar, { backgroundColor: color }]}>
                      <Text style={styles.oweAvatarText}>{getInitials(name)}</Text>
                    </View>
                    <Text style={styles.oweName}>{name}</Text>
                    <Text style={styles.oweAmount}>
                      {currency} {split.amount.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
          </View>
        )}

        {/* Delete button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑 Delete Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBack: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    fontSize: 22,
    color: '#4F46E5',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    width: 50,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  amountCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  expenseDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
    textAlign: 'center',
  },
  expenseAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  paidByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 8,
  },
  paidByAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidByAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paidByText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  paidByName: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  splitAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  splitAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  splitInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  splitPercentage: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  splitAmountContainer: {
    alignItems: 'flex-end',
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  splitOwed: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },
  splitPaid: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  oweRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  oweAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  oweAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  oweName: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  oweAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default ExpenseDetailScreen;