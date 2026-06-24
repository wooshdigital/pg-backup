import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@context/ThemeContext';
import { TripsScreen } from '@screens/TripsScreen';
import { TripStack } from '@constants/routes';
import { Body, Caption, H2 } from '@components/common/Typography';
import { spacing } from '@constants/theme';
import type { TripStackParamList } from '@types/index';

// ─── Stack Navigator ──────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<TripStackParamList>();

// ─── Placeholder Screens ──────────────────────────────────────────────────────

function TripDetailScreen(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={[styles.placeholder, { backgroundColor: theme.colors.background }]}>
      <Body style={styles.placeholderEmoji}>🗺️</Body>
      <H2 align="center">Trip Detail</H2>
      <Caption align="center" color={theme.colors.textSecondary}>
        Coming in Phase 2
      </Caption>
    </View>
  );
}

function AddExpenseScreen(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={[styles.placeholder, { backgroundColor: theme.colors.background }]}>
      <Body style={styles.placeholderEmoji}>💳</Body>
      <H2 align="center">Add Expense</H2>
      <Caption align="center" color={theme.colors.textSecondary}>
        Coming in Phase 2
      </Caption>
    </View>
  );
}

function ExpenseDetailScreen(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={[styles.placeholder, { backgroundColor: theme.colors.background }]}>
      <Body style={styles.placeholderEmoji}>🧾</Body>
      <H2 align="center">Expense Detail</H2>
      <Caption align="center" color={theme.colors.textSecondary}>
        Coming in Phase 2
      </Caption>
    </View>
  );
}

// ─── Navigator Component ──────────────────────────────────────────────────────

export function TripStackNavigator(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={TripStack.TripsList}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={TripStack.TripsList}
        component={TripsScreen}
        options={{ title: 'Trips' }}
      />
      <Stack.Screen
        name={TripStack.TripDetail}
        component={TripDetailScreen}
        options={{ title: 'Trip Detail', headerShown: true }}
      />
      <Stack.Screen
        name={TripStack.AddExpense}
        component={AddExpenseScreen}
        options={{ title: 'Add Expense', headerShown: true, presentation: 'modal' }}
      />
      <Stack.Screen
        name={TripStack.ExpenseDetail}
        component={ExpenseDetailScreen}
        options={{ title: 'Expense Detail', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[8],
  },
  placeholderEmoji: {
    fontSize: 56,
  },
});