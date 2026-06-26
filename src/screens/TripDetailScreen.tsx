import React, { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../types';
import { TripDetailTabs } from '../navigation/TripDetailTabs';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen({ route, navigation }: Props) {
  const { tripId, tripName } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: tripName,
      headerBackTitle: 'Trips',
    });
  }, [navigation, tripName]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <TripDetailTabs tripId={tripId} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});