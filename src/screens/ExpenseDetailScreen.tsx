import React, { useContext, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TripContext } from '../context/TripContext';
import { CURRENCIES } from '../constants/currencies';

type ExpenseDetailRouteParams = {
  ExpenseDetail: {
    tripId: string;
    expenseId: string;
  };
};

type ExpenseDetailRouteProp = RouteProp<
  ExpenseDetailRouteParams,
  'ExpenseDetail'
>;

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  food: 'Food & Drinks',
  transport: 'Transport',
  accommodation: 'Accommodation',
  activities: 'Activities',
  shopping: 'Shopping',
  health: 'Health',
  other: 'Other',
};

export const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ExpenseDetailRouteProp>();
  const { tripId, expenseId } = route.params;

  const { state, dispatch } = useContext(TripContext);
  const trip = state.trips.find((t) => t.id === tripId);
  const expense = trip?.expenses?.find((e: any) => e.id === expenseId);
  const participants = trip?.participants ?? [];

  const currencySymbol =
    CURRENCIES.find((c) => c.code === expense?.currency)?.symbol ?? '$';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Expense Detail',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.editButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, expense]);

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
              type: 'TRIP_DELETE_EXPENSE',
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
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Expense not found.</Text>
      </View>
    );
  }

  const paidByParticipant = participants.find(
    (p: any) => p.id === expense.paidBy
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.card}>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.amount}>
          {currencySymbol}
          {Number(expense.amount).toFixed(2)}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {CATEGORY_LABELS[expense.category] ?? expense.category ?? 'General'}
            </Text>
          </View>
          <Text style={styles.metaDate}>{formatDate(expense.date)}</Text>
        </View>
      </View>

      {/* Paid By */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paid By</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.avatarText}>
                {paidByParticipant?.name?.substring(0, 2).toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.participantName}>
              {paidByParticipant?.name ?? expense.paidBy}
            </Text>
            <Text style={styles.paidAmount}>
              {currencySymbol}
              {Number(expense.amount).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Splits */}
      {expense.splits && expense.splits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Split ({expense.splitType === 'custom' ? 'Custom' : 'Equal'})
          </Text>
          <View style={styles.card}>
            {expense.splits.map((split: any, index: number) => {
              const p = participants.find((x: any) => x.id === split.participantId);
              return (
                <View
                  key={split.participantId}
                  style={[
                    styles.splitRow,
                    index < expense.splits.length - 1 && styles.splitRowBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: getColor(p?.name ?? '') },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(p?.name ?? '?')}
                    </Text>
                  </View>
                  <Text style={styles.participantName}>
                    {p?.name ?? split.participantId}
                  </Text>
                  <Text style={styles.splitAmount}>
                    {currencySymbol}
                    {Number(split.amount).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>Delete Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

function getColor(name: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#FFB347',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  description: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C3C43',
  },
  metaDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  splitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  participantName: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  paidAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C3C43',
  },
  editButton: {
    marginRight: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButton: {
    marginTop: 32,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
  },
});

export default ExpenseDetailScreen;