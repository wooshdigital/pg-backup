import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Trip } from '../../types';
import { formatDateRange } from '../../utils/formatters';
import { getCurrencyByCode } from '../../constants/currencies';
import { SwipeableRow } from '../common/SwipeableRow';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onDelete: () => void;
}

export function TripCard({ trip, onPress, onDelete }: TripCardProps) {
  const currency = getCurrencyByCode(trip.currency);
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const participantCount = trip.participantIds.length;

  return (
    <SwipeableRow onDelete={onDelete}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Trip: ${trip.name}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.tripName} numberOfLines={1}>
              {trip.name}
            </Text>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyFlag}>{currency?.flag ?? '🌐'}</Text>
              <Text style={styles.currencyCode}>{trip.currency}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{dateRange}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <Text style={styles.infoText}>
              {participantCount === 0
                ? 'No participants yet'
                : `${participantCount} participant${participantCount !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.swipeHint}>Swipe left to delete</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
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
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 6,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginTop: 4,
  },
  swipeHint: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
});