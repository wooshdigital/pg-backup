import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTrips } from '../hooks/useTrips';
import { Trip } from '../types';
import { TripCard } from '../components/trips/TripCard';
import { EmptyTripsState } from '../components/trips/EmptyTripsState';
import { FAB } from '../components/common/FAB';

export function TripsListScreen() {
  const navigation = useNavigation<any>();
  const { trips, loaded, deleteTrip } = useTrips();

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', { tripId: trip.id });
    },
    [navigation],
  );

  const handleCreateTrip = useCallback(() => {
    navigation.navigate('CreateTrip');
  }, [navigation]);

  const renderItem: ListRenderItem<Trip> = useCallback(
    ({ item }) => (
      <TripCard trip={item} onPress={handleTripPress} onDelete={deleteTrip} />
    ),
    [handleTripPress, deleteTrip],
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Trips</Text>
          <Text style={styles.count}>
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
          </Text>
        </View>

        <FlatList
          data={trips}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={trips.length === 0 ? styles.emptyContent : styles.listContent}
          ListEmptyComponent={<EmptyTripsState onCreateTrip={handleCreateTrip} />}
          showsVerticalScrollIndicator={false}
        />

        <FAB
          onPress={handleCreateTrip}
          icon="+"
          accessibilityLabel="Create new trip"
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  } as ViewStyle,
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  } as ViewStyle,
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  } as TextStyle,
  count: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  } as TextStyle,
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  } as ViewStyle,
  emptyContent: {
    flexGrow: 1,
  } as ViewStyle,
});