import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeableRow } from '../common/SwipeableRow';
import { getCurrencyByCode } from '../../constants/currencies';
import { formatDateRange } from '../../utils/formatters';
import { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onDelete: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress, onDelete }) => {
  const currency = getCurrencyByCode(trip.currency);
  const dateRange = formatDateRange(trip.startDate, trip.endDate);

  return (
    <SwipeableRow onDelete={onDelete}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Trip: ${trip.name}`}
      >
        <View style={styles.topRow}>
          <Text style={styles.tripName} numberOfLines={1}>
            {trip.name}
          </Text>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyFlag}>{currency?.flag ?? '🌐'}</Text>
            <Text style={styles.currencyCode}>{trip.currency}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>{dateRange}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>
              {trip.participantIds.length === 0
                ? 'No participants'
                : `${trip.participantIds.length} participant${
                    trip.participantIds.length === 1 ? '' : 's'
                  }`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tripName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  currencyFlag: {
    fontSize: 14,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F6EF7',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});