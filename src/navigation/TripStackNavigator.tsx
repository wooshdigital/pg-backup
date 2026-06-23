import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsScreen } from '../screens/TripsScreen';
import { useTheme } from '../context/ThemeContext';
import { TripRoute } from '../constants/routes';
import { typography } from '../constants/theme';
import type { TripStackParamList } from '../types';

// ─── Navigator ────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<TripStackParamList>();

export function TripStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={TripRoute.TRIPS_LIST}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.semibold,
          fontSize: typography.fontSize.md,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name={TripRoute.TRIPS_LIST}
        component={TripsScreen}
        options={{
          title: 'My Trips',
        }}
      />
    </Stack.Navigator>
  );
}

export default TripStackNavigator;