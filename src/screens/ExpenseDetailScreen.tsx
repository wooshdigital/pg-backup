import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useExpenses } from '../hooks/useExpenses';
import { useParticipants } from '../hooks/useParticipants';

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, 'ExpenseDetail'>;
type ExpenseDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'ExpenseDetail'>;

function getCurrencySymbol(currency: string): string {
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    return formatted.replace(/[\d,.\s]/g, '').trim();
  } catch {
    return currency;
  }
}

export default function ExpenseDetailScreen() {
  const navigation = useNavigation<ExpenseDetailNavProp>();
  const route = useRoute<ExpenseDetailRouteProp>();
  const { tripId, expenseId } = route.params;

  const { expenses, deleteExpense } = useExpenses(tripId);
  const { participants } = useParticipants(tripId);

  const expense = expenses.find((e) => e.id === expenseId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: expense?.description ?? 'Expense',
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddExpense', { tripId, expenseId })
          }
          style={styles.editBtn}
          accessibilityLabel="Edit expense"
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, expense, tripId, expenseId]);

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Expense not found.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const paidBy = participants.find((p) => p.id === expense.paidById);
  const symbol = getCurrencySymbol(expense.currency);

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(expenseId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.expenseDescription}>{expense.description}</Text>
          <Text style={styles.expenseAmount}>
            {symbol}{expense.amount.toFixed(2)}
          </Text>
          <Text style={styles.expenseCurrency}>{expense.currency}</Text>
        </View>

        {/* Meta info */}
        <View style={styles.section}>
          <DetailRow label="Paid by" value={paidBy?.name ?? 'Unknown'} />
          <DetailRow
            label="Date"
            value={expense.date ? new Date(expense.date).toLocaleDateString() : '—'}
          />
          <DetailRow
            label="Split type"
            value={expense.splitType === 'custom' ? 'Custom' : 'Equal'}
          />
          {expense.notes ? (
            <DetailRow label="Notes" value={expense.notes} />
          ) : null}
        </View>

        {/* Splits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split Breakdown</Text>
          {expense.splits.map((split) => {
            const participant = participants.find(
              (p) => p.id === split.participantId
            );
            const percentage =
              expense.amount > 0
                ? ((split.amount / expense.amount) * 100).toFixed(0)
                : '0';
            return (
              <View key={split.participantId} style={styles.splitRow}>
                <View
                  style={[
                    styles.splitAvatar,
                    { backgroundColor: participant?.avatarColor || '#6366F1' },
                  ]}
                >
                  <Text style={styles.splitAvatarText}>
                    {(participant?.name ?? '?')
                      .split(' ')
                      .map((w: string) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
                <Text style={styles.splitName}>{participant?.name ?? 'Unknown'}</Text>
                <Text style={styles.splitPercent}>{percentage}%</Text>
                <Text style={styles.splitAmount}>
                  {symbol}{split.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Delete button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Edit button in header
  editBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  editBtnText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },

  // Amount card
  amountCard: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  expenseDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  expenseAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  expenseCurrency: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Split rows
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  splitAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  splitAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  splitName: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  splitPercent: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 12,
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },

  // Delete
  deleteBtn: {
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginTop: 8,
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },

  // Not found
  notFoundText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});