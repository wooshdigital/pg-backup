import React, { useLayoutEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripDetailTabs } from '../navigation/TripDetailTabs';
import { RootStackParamList } from '../types';

type TripDetailRouteProp = RouteProp<RootStackParamList, 'TripDetail'>;
type TripDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen() {
  const route = useRoute<TripDetailRouteProp>();
  const navigation = useNavigation<TripDetailNavProp>();
  const { tripId, tripName } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: tripName,
      headerBackTitle: 'Trips',
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
    backgroundColor: '#F9FAFB',
  },
});

export default TripDetailScreen;