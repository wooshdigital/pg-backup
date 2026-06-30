import React, { useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTripContext } from '../context/TripContext';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { Expense } from '../types';

type RootStackParamList = {
  Expenses: { tripId: string };
};

type ExpensesRouteProp = RouteProp<RootStackParamList, 'Expenses'>;

export function ExpensesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ExpensesRouteProp>();
  const { tripId } = route.params;
  const { state, dispatch } = useTripContext();

  const trip = state.trips.find((t) => t.id === tripId);
  const { sections, total } = useExpenses(tripId);

  const handleDelete = useCallback(
    (expenseId: string) => {
      Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            dispatch({
              type: 'TRIP_DELETE_EXPENSE',
              payload: { tripId, expenseId },
            }),
        },
      ]);
    },
    [tripId, dispatch]
  );

  const renderRightActions = useCallback(
    (expenseId: string) => (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(expenseId)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    ),
    [handleDelete]
  );

  const renderItem = useCallback(
    ({ item }: { item: Expense }) => (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
      >
        <ExpenseCard
          expense={item}
          participants={trip?.participants || []}
          onPress={() =>
            navigation.navigate('ExpenseDetail', { tripId, expenseId: item.id })
          }
        />
      </Swipeable>
    ),
    [trip, tripId, navigation, renderRightActions]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    []
  );

  const ListEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🧾</Text>
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to log your first expense.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Summary bar */}
      {sections.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryAmount}>
            {trip?.currency || 'USD'} {total.toFixed(2)}
          </Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={
          sections.length === 0 ? styles.emptyList : styles.list
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense', { tripId })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  list: {
    paddingVertical: 12,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 4,
    marginRight: 16,
    borderRadius: 14,
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
    marginTop: -2,
  },
});