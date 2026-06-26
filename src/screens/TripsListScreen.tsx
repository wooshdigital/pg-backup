import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { Trip } from '../types';
import type { TripStackParamList } from '../navigation/TripStackNavigator';

type TripsListNavProp = NativeStackNavigationProp<TripStackParamList, 'TripsList'>;

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
      <Text style={styles.cardMeta}>
        {trip.participants?.length ?? 0} participant
        {(trip.participants?.length ?? 0) !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
}

export function TripsListScreen() {
  const navigation = useNavigation<TripsListNavProp>();
  const { trips, loading } = useTrips();

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetail', { tripId: trip.id, tripName: trip.name });
  };

  const handleCreateTrip = () => {
    navigation.navigate('CreateTrip');
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✈️</Text>
      <Text style={styles.emptyTitle}>No trips yet</Text>
      <Text style={styles.emptySubtitle}>Tap + to create your first trip</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard trip={item} onPress={() => handleTripPress(item)} />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={trips.length === 0 ? styles.emptyList : styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateTrip}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  cardCurrency: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardMeta: {
    fontSize: 13,
    color: '#AEAEB2',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default TripsListScreen;