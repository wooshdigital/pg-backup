import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripStackParamList } from '../navigation/TripStackNavigator';
import { useTripContext } from '../context/TripContext';
import { formatAmount } from '../utils/splitCalculator';

type RouteType = RouteProp<TripStackParamList, 'ExpenseDetail'>;
type Nav = NativeStackNavigationProp<TripStackParamList>;

export function ExpenseDetailScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<Nav>();
  const { tripId, expenseId } = route.params;
  const { getTrip } = useTripContext();

  const trip = getTrip(tripId);
  const expense = trip?.expenses.find((e) => e.id === expenseId);

  if (!trip || !expense) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Expense not found</Text>
      </SafeAreaView>
    );
  }

  const participantMap = new Map(trip.participants.map((p) => [p.id, p]));
  const payer = participantMap.get(expense.payerId);

  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.expenseTitle}>{expense.title}</Text>
          <Text style={styles.heroAmount}>
            {formatAmount(expense.amount, expense.currency)}
          </Text>
          <Text style={styles.heroDate}>{formattedDate}</Text>
        </View>

        {/* Payer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Paid by</Text>
          <View style={styles.card}>
            {payer && (
              <View style={styles.payerRow}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: payer.avatarColor || '#6366F1' },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {payer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.payerName}>{payer.name}</Text>
                  {payer.email && (
                    <Text style={styles.payerEmail}>{payer.email}</Text>
                  )}
                </View>
                <Text style={styles.payerAmount}>
                  {formatAmount(expense.amount, expense.currency)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Split Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Split ({expense.splitType === 'equal' ? 'Equally' : 'Custom'})
          </Text>
          <View style={styles.card}>
            {expense.splits.map((split, index) => {
              const participant = participantMap.get(split.participantId);
              if (!participant) return null;
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
                      styles.smallAvatar,
                      { backgroundColor: participant.avatarColor || '#6366F1' },
                    ]}
                  >
                    <Text style={styles.smallAvatarText}>
                      {participant.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.splitName}>{participant.name}</Text>
                  <Text style={styles.splitAmount}>
                    {formatAmount(split.amount, expense.currency)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Details</Text>
          <View style={styles.card}>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Currency</Text>
              <Text style={styles.metaValue}>{expense.currency}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaRowBorder]}>
              <Text style={styles.metaKey}>Participants</Text>
              <Text style={styles.metaValue}>{expense.splits.length}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaRowBorder]}>
              <Text style={styles.metaKey}>Created</Text>
              <Text style={styles.metaValue}>
                {new Date(expense.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6B7280',
  },
  heroCard: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  payerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  payerEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  payerAmount: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  splitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  smallAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  smallAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  splitName: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metaRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaKey: {
    fontSize: 15,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});