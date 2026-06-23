import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { TripsScreen } from '../screens/TripsScreen';
import { TripRoutes } from '../constants/routes';
import type { TripStackParamList } from '../types';

// ─── Stack ────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<TripStackParamList>();

// ─── Navigator ────────────────────────────────────────────────────────────────

export function TripStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={TripRoutes.TripsList}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.lg,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={TripRoutes.TripsList}
        component={TripsScreen}
        options={{ headerShown: false }}
      />
      {/* Future screens will be added here in later phases */}
    </Stack.Navigator>
  );
}