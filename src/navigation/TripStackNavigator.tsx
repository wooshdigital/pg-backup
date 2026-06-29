import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsListScreen } from '../screens/TripsListScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function TripStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#6366F1',
        headerTitleStyle: {
          fontWeight: '700',
          color: '#111827',
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
          title: (route.params as any)?.tripName ?? 'Trip Detail',
          headerBackTitle: 'Trips',
        })}
      />
    </Stack.Navigator>
  );
}

export default TripStackNavigator;