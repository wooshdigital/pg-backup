import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { useTrips } from '../hooks/useTrips';
import { Trip } from '../types';

interface TripsListScreenProps {
  navigation: any;
}

function TripCard({
  trip,
  onPress,
}: {
  trip: Trip;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {trip.name}
        </Text>
        <Text style={styles.cardCurrency}>{trip.currency}</Text>
      </View>
      {trip.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {trip.description}
        </Text>
      ) : null}
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>
          {trip.participants?.length ?? 0}{' '}
          {trip.participants?.length === 1 ? 'participant' : 'participants'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function TripsListScreen({ navigation }: TripsListScreenProps) {
  const { trips, loading } = useTrips();

  const handleTripPress = useCallback(
    (tripId: string) => {
      navigation.navigate('TripDetail', { tripId });
    },
    [navigation]
  );

  const renderItem: ListRenderItem<Trip> = useCallback(
    ({ item }) => (
      <TripCard trip={item} onPress={() => handleTripPress(item.id)} />
    ),
    [handleTripPress]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✈️</Text>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the button below to plan your first adventure.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTrip')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  cardCurrency: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
});