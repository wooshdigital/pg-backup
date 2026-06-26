import React, { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
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
  const { getTripById } = useTrips();
  const trip = getTripById(tripId);

  useLayoutEffect(() => {
    if (trip) {
      navigation.setOptions({ title: trip.name });
    }
  }, [navigation, trip]);

  return <TripDetailTabs tripId={tripId} />;
}

const styles = StyleSheet.create({});