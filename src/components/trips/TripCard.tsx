import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SwipeableRow } from '../common/SwipeableRow';
import { Trip } from '../../types';
import { formatDateRange } from '../../utils/formatters';
import { getCurrencyByCode } from '../../constants/currencies';

interface TripCardProps {
  trip: Trip;
  onPress?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress, onDelete }) => {
  const currency = getCurrencyByCode(trip.currency);
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const participantCount = trip.participantIds.length;

  const handleDelete = () => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(trip),
        },
      ],
    );
  };

  return (
    <SwipeableRow onDelete={handleDelete} deleteLabel="Delete">
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress?.(trip)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Trip: ${trip.name}, ${dateRange}`}
      >
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.tripName} numberOfLines={1}>
                {trip.name}
              </Text>
              {currency && (
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {dateRange || 'No dates set'}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>👥</Text>
              <Text style={styles.metaText}>
                {participantCount === 0
                  ? 'No participants'
                  : `${participantCount} participant${participantCount !== 1 ? 's' : ''}`}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🧾</Text>
              <Text style={styles.metaText}>
                {trip.expenseIds.length} expense{trip.expenseIds.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chevronContainer}>
          <Text style={styles.cardChevron}>›</Text>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  header: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tripName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  currencyFlag: {
    fontSize: 14,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  metaRow: {
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  cardChevron: {
    fontSize: 22,
    color: '#D1D5DB',
    fontWeight: '300',
  },
});