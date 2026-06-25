import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTrips } from '../hooks/useTrips';
import { TripCard } from '../components/trips/TripCard';
import { EmptyTripsState } from '../components/trips/EmptyTripsState';
import { FAB } from '../components/common/FAB';
import { Trip } from '../types';

// You may want to use your actual navigation types here
type RootStackParamList = {
  TripsList: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TripsList'>;
};

export function TripsListScreen({ navigation }: Props) {
  const { trips, isLoaded, deleteTrip } = useTrips();

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', { tripId: trip.id });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTrip(id);
    },
    [deleteTrip],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreateTrip');
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCard
        trip={item}
        onPress={() => handleTripPress(item)}
        onDelete={() => handleDelete(item.id)}
      />
    ),
    [handleTripPress, handleDelete],
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading trips…</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trips</Text>
          <Text style={styles.headerSubtitle}>
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
          </Text>
        </View>

        <FlatList
          data={trips}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            trips.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={
            <EmptyTripsState onCreatePress={handleCreatePress} />
          }
          showsVerticalScrollIndicator={false}
        />

        <FAB
          onPress={handleCreatePress}
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 96,
  },
  listContentEmpty: {
    flex: 1,
  },
});