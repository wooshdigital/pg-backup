import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { Trip, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Trips'>;

export function TripsListScreen() {
  const { trips, loaded } = useTrips();
  const navigation = useNavigation<NavigationProp>();

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', { tripId: trip.id, tripName: trip.name });
    },
    [navigation]
  );

  const renderTrip = useCallback(
    ({ item }: { item: Trip }) => (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => handleTripPress(item)}
        activeOpacity={0.7}
        accessibilityLabel={`Open trip ${item.name}`}
        accessibilityRole="button"
      >
        <View style={styles.tripCardInner}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.description ? (
              <Text style={styles.tripDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.tripMeta}>
              <Text style={styles.tripMetaText}>
                {item.participants?.length ?? 0} participant
                {(item.participants?.length ?? 0) !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.tripMetaDot}>·</Text>
              <Text style={styles.tripMetaText}>{item.currency}</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleTripPress]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  const renderEmpty = () => {
    if (!loaded) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🌍</Text>
        <Text style={styles.emptyTitle}>No Trips Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first trip to start tracking shared expenses.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          trips.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tripCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  tripDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
    lineHeight: 20,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripMetaText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tripMetaDot: {
    fontSize: 13,
    color: '#C7C7CC',
  },
  chevron: {
    fontSize: 22,
    color: '#C7C7CC',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
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
});

export default TripsListScreen;