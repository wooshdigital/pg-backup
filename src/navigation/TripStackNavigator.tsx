import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { TripsScreen } from '../screens/TripsScreen';
import { TripRoutes } from '../constants/routes';
import type { TripStackParamList } from '../types';

// ─── Stack Navigator ──────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<TripStackParamList>();

// ─── Placeholder Screens ──────────────────────────────────────────────────────
// These will be replaced with real implementations in future phases

// ─── Component ────────────────────────────────────────────────────────────────

export function TripStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={TripRoutes.TripsList}
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={TripRoutes.TripsList}
        component={TripsScreen}
        options={{
          title: 'Trips',
        }}
      />
      {/* Future screens — placeholders until Phase 2 */}
      {/* TripDetail, TripCreate, ExpenseCreate, ExpenseDetail */}
    </Stack.Navigator>
  );
}