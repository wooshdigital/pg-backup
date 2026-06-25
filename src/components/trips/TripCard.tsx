import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Trip } from '../../types';
import { SwipeableRow } from '../common/SwipeableRow';
import { formatDateRange, getCurrencySymbol } from '../../utils/formatters';
import { getCurrencyByCode } from '../../constants/currencies';

interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
  onDelete: (id: string) => void;
}

export function TripCard({ trip, onPress, onDelete }: TripCardProps) {
  const currency = getCurrencyByCode(trip.currency);
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const participantCount = trip.participantIds.length;
  const expenseCount = trip.expenseIds.length;

  return (
    <SwipeableRow onDelete={() => onDelete(trip.id)}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(trip)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Trip: ${trip.name}`}
      >
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {trip.name}
          </Text>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyFlag}>{currency?.flag ?? '🌍'}</Text>
            <Text style={styles.currencyCode}>{trip.currency}</Text>
          </View>
        </View>

        <Text style={styles.dateRange}>{dateRange}</Text>

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statText}>
              {participantCount} {participantCount === 1 ? 'person' : 'people'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🧾</Text>
            <Text style={styles.statText}>
              {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  } as ViewStyle,
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  } as TextStyle,
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  } as ViewStyle,
  currencyFlag: {
    fontSize: 14,
    marginRight: 4,
  } as TextStyle,
  currencyCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  } as TextStyle,
  dateRange: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    gap: 16,
  } as ViewStyle,
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  statIcon: {
    fontSize: 13,
  } as TextStyle,
  statText: {
    fontSize: 13,
    color: '#6B7280',
  } as TextStyle,
});