import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsListScreen } from '../screens/TripsListScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';

export type TripStackParamList = {
  TripsList: undefined;
  TripDetail: { tripId: string; tripName: string };
  CreateTrip: undefined;
};

const Stack = createNativeStackNavigator<TripStackParamList>();

export function TripStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontWeight: '600',
          color: '#1C1C1E',
        },
        headerShadowVisible: false,
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
        options={({ route }) => ({
          title: route.params.tripName,
          headerBackTitle: 'Trips',
        })}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          title: 'New Trip',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export default TripStackNavigator;