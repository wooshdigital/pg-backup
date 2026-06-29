import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTripContext } from '../context/TripContext';
import { Trip, RootStackParamList } from '../types';

type TripsNavProp = NativeStackNavigationProp<RootStackParamList>;

export function TripsListScreen() {
  const { state } = useTripContext();
  const navigation = useNavigation<TripsNavProp>();

  const handleTripPress = useCallback(
    (trip: Trip) => {
      navigation.navigate('TripDetail', { tripId: trip.id, tripName: trip.name });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Trip>) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleTripPress(item)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Open trip ${item.name}`}
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
          <View style={styles.meta}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{item.currency}</Text>
            </View>
            <Text style={styles.metaParticipants}>
              {item.participants?.length ?? 0} participant
              {(item.participants?.length ?? 0) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ),
    [handleTripPress]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={state.trips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={state.trips.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          <Text style={styles.heading}>My Trips</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✈️</Text>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first trip to get started.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  tripName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  tripDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  metaParticipants: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 22,
    color: '#D1D5DB',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TripsListScreen;