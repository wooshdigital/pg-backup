import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsListScreen } from '../screens/TripsListScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function TripStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#3F51B5',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: '#1A1A2E',
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F5F5F5' },
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
        options={({ route }) => ({ title: route.params.tripName })}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ title: 'New Trip', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}