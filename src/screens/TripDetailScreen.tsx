import React, { useLayoutEffect } from 'react';
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: tripName,
    });
  }, [navigation, tripName]);

  return (
    <View style={styles.container}>
      <TripDetailTabs tripId={tripId} />
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