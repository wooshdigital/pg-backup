import React, { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { TripDetailTabs } from '../navigation/TripDetailTabs';

interface TripDetailScreenProps {
  route: {
    params: {
      tripId: string;
      tripName: string;
    };
  };
  navigation: any;
}

export function TripDetailScreen({ route, navigation }: TripDetailScreenProps) {
  const { tripId, tripName } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: tripName,
      headerBackTitle: 'Trips',
    });
  }, [navigation, tripName]);

  return <TripDetailTabs tripId={tripId} />;
}

export default TripDetailScreen;