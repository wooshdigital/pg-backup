import React from 'react';
import { View, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.container}>
      <TripDetailTabs tripId={tripId} tripName={tripName} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default TripDetailScreen;