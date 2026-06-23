import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsScreen } from '../screens/TripsScreen';
import { useTheme } from '../context/ThemeContext';
import { TripRoute, type TripStackParamList } from '../constants/routes';

// ─── Placeholder Screens ──────────────────────────────────────────────────────
// These will be replaced with real screens in Phase 2

import { View, Text, StyleSheet } from 'react-native';

function PlaceholderScreen({ route }: { route: { name: string } }) {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.emoji}>🚧</Text>
      <Text style={placeholderStyles.title}>{route.name}</Text>
      <Text style={placeholderStyles.subtitle}>Coming in Phase 2</Text>
    </View>
  );
}

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

// ─── Navigator ────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<TripStackParamList>();

export function TripStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={TripRoute.TripsList}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: theme.colors.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name={TripRoute.TripsList}
        component={TripsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={TripRoute.TripDetail}
        component={PlaceholderScreen}
        options={{ title: 'Trip Detail' }}
      />
      <Stack.Screen
        name={TripRoute.TripCreate}
        component={PlaceholderScreen}
        options={{ title: 'New Trip', presentation: 'modal' }}
      />
      <Stack.Screen
        name={TripRoute.TripEdit}
        component={PlaceholderScreen}
        options={{ title: 'Edit Trip', presentation: 'modal' }}
      />
      <Stack.Screen
        name={TripRoute.ExpenseDetail}
        component={PlaceholderScreen}
        options={{ title: 'Expense Detail' }}
      />
      <Stack.Screen
        name={TripRoute.ExpenseCreate}
        component={PlaceholderScreen}
        options={{ title: 'Add Expense', presentation: 'modal' }}
      />
      <Stack.Screen
        name={TripRoute.ExpenseEdit}
        component={PlaceholderScreen}
        options={{ title: 'Edit Expense', presentation: 'modal' }}
      />
      <Stack.Screen
        name={TripRoute.ParticipantDetail}
        component={PlaceholderScreen}
        options={{ title: 'Participant' }}
      />
      <Stack.Screen
        name={TripRoute.ParticipantAdd}
        component={PlaceholderScreen}
        options={{ title: 'Add Participant', presentation: 'modal' }}
      />
      <Stack.Screen
        name={TripRoute.Balances}
        component={PlaceholderScreen}
        options={{ title: 'Balances' }}
      />
      <Stack.Screen
        name={TripRoute.Settlement}
        component={PlaceholderScreen}
        options={{ title: 'Settlement', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}