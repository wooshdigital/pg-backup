import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenses } from '../hooks/useExpenses';
import { useParticipants } from '../hooks/useParticipants';
import { formatCurrency } from '../utils/formatters';

type RootStackParamList = {
  ExpenseDetail: { tripId: string; expenseId: string };
  AddExpense: { tripId: string; expenseId?: string };
};

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, 'ExpenseDetail'>;
type ExpenseDetailNavProp = NativeStackNavigationProp<RootStackParamList>;

export function ExpenseDetailScreen() {
  const navigation = useNavigation<ExpenseDetailNavProp>();
  const route = useRoute<ExpenseDetailRouteProp>();
  const { tripId, expenseId } = route.params;

  const { expenses, deleteExpense } = useExpenses(tripId);
  const { participants } = useParticipants(tripId);

  const expense = expenses.find((e) => e.id === expenseId);
  const paidBy = participants.find((p) => p.id === expense?.paidById);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddExpense', { tripId, expenseId })
          }
          style={styles.editButton}
          accessibilityLabel="Edit expense"
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, tripId, expenseId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(expenseId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!expense) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Expense not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <Text style={styles.expenseDescription}>{expense.description}</Text>
        <Text style={styles.expenseAmount}>
          {expense.currency} {formatCurrency(expense.amount)}
        </Text>
        <Text style={styles.paidByText}>
          Paid by {paidBy?.name ?? 'Unknown'}
        </Text>
        {expense.date && (
          <Text style={styles.dateText}>
            {new Date(expense.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        )}
      </View>

      {/* Splits */}
      {expense.splits && expense.splits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split Details</Text>
          {expense.splits.map((split: any) => {
            const participant = participants.find(
              (p) => p.id === split.participantId
            );
            return (
              <View key={split.participantId} style={styles.splitRow}>
                <Text style={styles.splitName}>
                  {participant?.name ?? 'Unknown'}
                </Text>
                <Text style={styles.splitAmount}>
                  {expense.currency} {formatCurrency(split.amount)}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Delete */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  expenseDescription: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2196F3',
    marginBottom: 8,
  },
  paidByText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  splitName: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  splitAmount: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
  },
});