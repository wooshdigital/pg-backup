import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsListScreen } from '../screens/TripsListScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';

export type TripStackParamList = {
  TripsList: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
};

const Stack = createNativeStackNavigator<TripStackParamList>();

export const TripStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TripsList" component={TripsListScreen} />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};