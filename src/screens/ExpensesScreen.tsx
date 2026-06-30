import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RootStackParamList } from '../types';
import { useTripContext } from '../context/TripContext';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { getCurrencySymbol } from '../utils/currency';

type ExpensesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExpensesScreenRouteProp = RouteProp<{ ExpensesTab: { tripId: string } }, 'ExpensesTab'>;

interface Props {
  tripId: string;
}

export function ExpensesScreen({ tripId }: Props) {
  const navigation = useNavigation<ExpensesScreenNavigationProp>();
  const { getTripById, deleteExpense } = useTripContext();
  const { sections, totalAmount } = useExpenses(tripId);

  const trip = getTripById(tripId);
  const currencySymbol = getCurrencySymbol(trip?.currency || 'USD');

  const handleDeleteExpense = useCallback((expenseId: string, title: string) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(tripId, expenseId),
        },
      ]
    );
  }, [tripId, deleteExpense]);

  const renderRightActions = useCallback((expenseId: string, title: string) => {
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => handleDeleteExpense(expenseId, title)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }, [handleDeleteExpense]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id, item.title)}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
      >
        <ExpenseCard
          expense={item}
          participants={trip?.participants || []}
          currencySymbol={currencySymbol}
          onPress={() =>
            navigation.navigate('ExpenseDetail', {
              tripId,
              expenseId: item.id,
            })
          }
        />
      </Swipeable>
    );
  }, [trip, currencySymbol, tripId, navigation, renderRightActions]);

  const renderSectionHeader = useCallback(({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  ), []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💸</Text>
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add your first expense
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {sections.length > 0 && (
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>
            {currencySymbol}{totalAmount.toFixed(2)}
          </Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={sections.length === 0 ? styles.emptyContent : styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense', { tripId })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C7D2FE',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  emptyContent: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 5,
    marginRight: 16,
    borderRadius: 14,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default ExpensesScreen;