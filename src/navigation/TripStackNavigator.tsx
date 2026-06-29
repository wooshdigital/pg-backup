import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsListScreen } from '../screens/TripsListScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';

export type TripStackParamList = {
  TripsList: undefined;
  TripDetail: { tripId: string };
  CreateTrip: undefined;
};

const Stack = createNativeStackNavigator<TripStackParamList>();

export function TripStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6C63FF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="TripsList"
        component={TripsListScreen}
        options={{ title: 'My Trips' }}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{ title: 'Trip Details' }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ title: 'New Trip', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}