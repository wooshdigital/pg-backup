import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { TripCard } from '../components/trips/TripCard';
import { EmptyTripsState } from '../components/trips/EmptyTripsState';
import { FAB } from '../components/common/FAB';
import { Trip } from '../types';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TripsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { trips, loaded, deleteTrip } = useTrips();

  const handleCreateTrip = useCallback(() => {
    navigation.navigate('CreateTrip');
  }, [navigation]);

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', { tripId: trip.id });
    },
    [navigation]
  );

  const handleDeleteTrip = useCallback(
    (id: string) => {
      deleteTrip(id);
    },
    [deleteTrip]
  );

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCard
        trip={item}
        onPress={() => handleTripPress(item)}
        onDelete={() => handleDeleteTrip(item.id)}
      />
    ),
    [handleTripPress, handleDeleteTrip]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6EF7" />
        <Text style={styles.loadingText}>Loading trips…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          trips.length === 0 && styles.listContentEmpty,
        ]}
        ListHeaderComponent={
          trips.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {trips.length} trip{trips.length === 1 ? '' : 's'}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyTripsState onCreateTrip={handleCreateTrip} />}
        showsVerticalScrollIndicator={false}
      />
      {trips.length > 0 && (
        <FAB onPress={handleCreateTrip} label="New Trip" />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  listContentEmpty: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  listHeaderText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});