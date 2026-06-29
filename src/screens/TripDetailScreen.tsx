import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTrips } from '../hooks/useTrips';
import { TripDetailTabs } from '../navigation/TripDetailTabs';

interface TripDetailScreenProps {
  route: {
    params: {
      tripId: string;
    };
  };
  navigation: any;
}

export function TripDetailScreen({ route, navigation }: TripDetailScreenProps) {
  const { tripId } = route.params;
  const { getTripById, loading } = useTrips();
  const trip = getTripById(tripId);

  useLayoutEffect(() => {
    if (trip) {
      navigation.setOptions({ title: trip.name });
    }
  }, [trip, navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Trip not found.</Text>
      </View>
    );
  }

  return <TripDetailTabs tripId={tripId} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
});