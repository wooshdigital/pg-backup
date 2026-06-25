import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { TripsListScreen } from '../screens/TripsListScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#4F6EF7',
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'SplitMate' }}
      />
      <Stack.Screen
        name="TripsList"
        component={TripsListScreen}
        options={{ title: 'My Trips' }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          title: 'New Trip',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};