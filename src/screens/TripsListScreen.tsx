import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native';
import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

interface TripsListScreenProps {
  navigation: any;
}

function TripCard({
  trip,
  onPress,
}: {
  trip: Trip;
  onPress: (trip: Trip) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(trip)}
      accessibilityRole="button"
      accessibilityLabel={`Open trip ${trip.name}`}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {trip.name}
        </Text>
        <View style={styles.participantBadge}>
          <Text style={styles.participantBadgeText}>
            {(trip.participants ?? []).length} 👤
          </Text>
        </View>
      </View>
      {trip.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {trip.description}
        </Text>
      ) : null}
      <View style={styles.cardFooter}>
        <Text style={styles.currencyText}>{trip.currency}</Text>
        {trip.startDate ? (
          <Text style={styles.dateText}>
            {new Date(trip.startDate).toLocaleDateString()}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export function TripsListScreen({ navigation }: TripsListScreenProps) {
  const { state } = useTripContext();

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', {
        tripId: trip.id,
        tripName: trip.name,
      });
    },
    [navigation]
  );

  const handleCreateTrip = useCallback(() => {
    navigation.navigate('CreateTrip' as any);
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Trip>) => (
      <TripCard trip={item} onPress={handleTripPress} />
    ),
    [handleTripPress]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌍</Text>
      <Text style={styles.emptyTitle}>No trips yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first trip and start planning your adventure!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateTrip}
        accessibilityRole="button"
      >
        <Text style={styles.createButtonText}>Create Trip</Text>
      </TouchableOpacity>
    </View>
  );

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading trips…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={state.trips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          state.trips.length === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
      />

      {state.trips.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateTrip}
          accessibilityLabel="Create trip"
          accessibilityRole="button"
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  participantBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  participantBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    marginTop: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default TripsListScreen;