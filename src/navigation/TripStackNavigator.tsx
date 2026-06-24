import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsScreen } from '../screens/TripsScreen';
import { useTheme } from '../context/ThemeContext';
import { TripRoutes, type TripStackParamList } from '../constants/routes';

// ─── Stack Navigator ──────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<TripStackParamList>();

export function TripStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={TripRoutes.TRIPS_LIST}
        component={TripsScreen}
        options={{ title: 'My Trips' }}
      />
      {/*
        Future screens to be added in Phase 2:
        <Stack.Screen name={TripRoutes.TRIP_DETAIL} component={TripDetailScreen} />
        <Stack.Screen name={TripRoutes.TRIP_CREATE} component={TripCreateScreen} />
        <Stack.Screen name={TripRoutes.EXPENSE_CREATE} component={ExpenseCreateScreen} />
        <Stack.Screen name={TripRoutes.PARTICIPANTS} component={ParticipantsScreen} />
        <Stack.Screen name={TripRoutes.SETTLEMENTS} component={SettlementsScreen} />
      */}
    </Stack.Navigator>
  );
}