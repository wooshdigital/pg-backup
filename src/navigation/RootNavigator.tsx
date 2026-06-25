import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripProvider } from '../context/TripContext';
import { TripsListScreen } from '../screens/TripsListScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';

export type RootStackParamList = {
  TripsList: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <TripProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="TripsList"
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
      </NavigationContainer>
    </TripProvider>
  );
}