import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

interface TripsListScreenProps {
  navigation: any;
}

export function TripsListScreen({ navigation }: TripsListScreenProps) {
  const { state } = useTripContext();
  const { trips, loading } = state;

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', {
        tripId: trip.id,
        tripName: trip.name,
      });
    },
    [navigation]
  );

  const renderItem: ListRenderItem<Trip> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleTripPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text style={styles.tripName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={styles.tripDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>
              {item.participants?.length ?? 0} participant
              {(item.participants?.length ?? 0) !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.metaCurrency}>{item.currency}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ),
    [handleTripPress]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✈️</Text>
      <Text style={styles.emptyTitle}>No trips yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first trip to get started.
      </Text>
    </View>
  );

  const handleAddTrip = () => {
    navigation.navigate('CreateTrip' as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading trips…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={
          trips.length === 0 ? styles.emptyList : styles.list
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTrip}
        activeOpacity={0.85}
        accessibilityLabel="Create new trip"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  tripName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  tripDescription: {
    fontSize: 14,
    color: '#636366',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  metaCurrency: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    color: '#C7C7CC',
    marginLeft: 8,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    fontWeight: '400',
  },
});

export default TripsListScreen;