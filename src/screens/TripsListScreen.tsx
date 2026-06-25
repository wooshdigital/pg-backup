import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTrips } from '../hooks/useTrips';
import { TripCard } from '../components/trips/TripCard';
import { EmptyTripsState } from '../components/trips/EmptyTripsState';
import { FAB } from '../components/common/FAB';
import { Trip } from '../types';

export const TripsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { trips, loading, deleteTrip } = useTrips();

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', { tripId: trip.id });
    },
    [navigation],
  );

  const handleTripDelete = useCallback(
    (trip: Trip) => {
      deleteTrip(trip.id);
    },
    [deleteTrip],
  );

  const handleCreateTrip = useCallback(() => {
    navigation.navigate('CreateTrip');
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Trips</Text>
          <Text style={styles.headerSubtitle}>
            {trips.length === 0
              ? 'Start planning your next adventure'
              : `${trips.length} trip${trips.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={handleTripPress}
              onDelete={handleTripDelete}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            trips.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={<EmptyTripsState />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <FAB
          onPress={handleCreateTrip}
          icon="+"
          accessibilityLabel="Create new trip"
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  separator: {
    height: 0,
  },
});