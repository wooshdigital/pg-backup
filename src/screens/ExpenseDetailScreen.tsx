import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTripContext } from '../context/TripContext';
import { SplitSummary } from '../components/expenses/SplitSummary';

type RootStackParamList = {
  ExpenseDetail: { tripId: string; expenseId: string };
};

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, 'ExpenseDetail'>;

export function ExpenseDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ExpenseDetailRouteProp>();
  const { tripId, expenseId } = route.params;
  const { state, dispatch } = useTripContext();

  const trip = state.trips.find((t) => t.id === tripId);
  const expense = trip?.expenses.find((e) => e.id === expenseId);

  if (!trip || !expense) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Expense not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const participantMap = new Map(trip.participants.map((p) => [p.id, p]));
  const payer = participantMap.get(expense.payerId);
  const payerInitials = payer ? getInitials(payer.name) : '?';

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
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
    ]);
  };

  const formattedDate = formatDate(expense.date);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Expense Detail
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Amount */}
        <View style={styles.heroSection}>
          <Text style={styles.expenseTitle}>{expense.title}</Text>
          <Text style={styles.expenseAmount}>
            {expense.currency} {expense.amount.toFixed(2)}
          </Text>
          <Text style={styles.expenseDate}>{formattedDate}</Text>
        </View>

        {/* Payer */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Paid by</Text>
          <View style={styles.payerRow}>
            <View
              style={[
                styles.payerAvatar,
                { backgroundColor: payer?.avatarColor || '#6366F1' },
              ]}
            >
              <Text style={styles.payerInitials}>{payerInitials}</Text>
            </View>
            <Text style={styles.payerName}>{payer?.name || 'Unknown'}</Text>
          </View>
        </View>

        {/* Split breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Split ({expense.splitType === 'equal' ? 'Equally' : 'Custom'})
          </Text>
          <SplitSummary
            splits={expense.splits}
            participants={trip.participants}
            currency={expense.currency}
          />
        </View>

        {/* Meta */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Trip</Text>
            <Text style={styles.metaValue}>{trip.name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Participants</Text>
            <Text style={styles.metaValue}>{expense.splits.length}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Added</Text>
            <Text style={styles.metaValue}>{formatDate(expense.createdAt.slice(0, 10))}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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

function formatDate(dateKey: string): string {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    width: 70,
  },
  backBtnText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  deleteBtn: {
    width: 70,
    alignItems: 'flex-end',
  },
  deleteBtnText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  expenseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  expenseAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6366F1',
  },
  expenseDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
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
  payerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  metaSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaKey: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: '#EF4444',
    fontSize: 16,
  },
});