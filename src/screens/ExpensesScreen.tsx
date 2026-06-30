import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { TripStackParamList } from '../navigation/TripStackNavigator';
import { useTripContext } from '../context/TripContext';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { Expense } from '../types';
import { formatAmount } from '../utils/splitCalculator';

type RouteType = RouteProp<TripStackParamList, 'Expenses'>;
type Nav = NativeStackNavigationProp<TripStackParamList>;

export function ExpensesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { tripId } = route.params;
  const { getTrip, dispatch } = useTripContext();
  const trip = getTrip(tripId);
  const { sections, totalAmount } = useExpenses(tripId);

  const handleAddExpense = () => {
    navigation.navigate('AddExpense', { tripId });
  };

  const handleExpensePress = (expense: Expense) => {
    navigation.navigate('ExpenseDetail', { tripId, expenseId: expense.id });
  };

  const handleDeleteExpense = useCallback(
    (expenseId: string) => {
      Alert.alert(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
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
            },
          },
        ]
      );
    },
    [dispatch, tripId]
  );

  const renderRightActions = (expenseId: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDeleteExpense(expenseId)}
    >
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Expense }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <ExpenseCard
        expense={item}
        participants={trip?.participants || []}
        onPress={() => handleExpensePress(item)}
      />
    </Swipeable>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => {
    const date = new Date(section.title + 'T00:00:00');
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    });
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{formatted}</Text>
      </View>
    );
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💸</Text>
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add your first expense
      </Text>
    </View>
  );

  const ListHeaderComponent = () =>
    sections.length > 0 ? (
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalAmount}>
          {formatAmount(totalAmount, trip?.currency || 'USD')}
        </Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  totalCard: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 8,
    marginLeft: 8,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
  },
});