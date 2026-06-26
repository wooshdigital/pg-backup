import React from 'react';
import { StyleSheet } from 'react-native';
import { TripDetailTabs } from '../navigation/TripDetailTabs';

interface TripDetailScreenProps {
  route: {
    params: {
      tripId: string;
      tripName: string;
    };
  };
}

export function TripDetailScreen({ route }: TripDetailScreenProps) {
  const { tripId, tripName } = route.params;
  return <TripDetailTabs tripId={tripId} tripName={tripName} />;
}

export default TripDetailScreen;