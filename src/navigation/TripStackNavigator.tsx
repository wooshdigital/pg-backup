import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { TripsScreen } from '../screens/TripsScreen';
import { TripRoute } from '../constants/routes';
import { Body, Caption } from '../components/common/Typography';
import type { TripStackParamList } from '../types';

// ─── Placeholder Screens ──────────────────────────────────────────────────────

import { SafeAreaView, ScrollView } from 'react-native';
import { Card } from '../components/common/Card';
import { H2, H3, BodySmall } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { spacing } from '../constants/theme';

function TripDetailScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <H2 style={styles.title}>Trip Detail</H2>
        <Card elevation="base">
          <Body>🚧 Trip detail screen coming soon</Body>
          <BodySmall color={theme.textSecondary} style={styles.comingSoon}>
            This screen will show trip info, expenses, balances, and settlement options.
          </BodySmall>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function AddExpenseScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <H2 style={styles.title}>Add Expense</H2>
        <Card elevation="base">
          <Body>🚧 Add expense screen coming soon</Body>
          <BodySmall color={theme.textSecondary} style={styles.comingSoon}>
            Enter expense details, select participants, and choose your split method.
          </BodySmall>
        </Card>
        <Button label="Save Expense" variant="primary" size="lg" fullWidth style={styles.button} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseDetailScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <H2 style={styles.title}>Expense Detail</H2>
        <Card elevation="base">
          <Body>🚧 Expense detail screen coming soon</Body>
          <BodySmall color={theme.textSecondary} style={styles.comingSoon}>
            View and edit expense breakdown, splits, and receipts.
          </BodySmall>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettlementsScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <H2 style={styles.title}>Settlements</H2>
        <Card elevation="base">
          <Body>🚧 Settlements screen coming soon</Body>
          <BodySmall color={theme.textSecondary} style={styles.comingSoon}>
            View suggested payments to settle all debts within the group.
          </BodySmall>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<TripStackParamList>();

export function TripStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.primary,
        headerTitleStyle: {
          color: theme.textPrimary,
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.background,
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
        component={TripDetailScreen}
        options={{ title: 'Trip Detail' }}
      />
      <Stack.Screen
        name={TripRoute.AddExpense}
        component={AddExpenseScreen}
        options={{ title: 'Add Expense', presentation: 'modal' }}
      />
      <Stack.Screen
        name={TripRoute.ExpenseDetail}
        component={ExpenseDetailScreen}
        options={{ title: 'Expense' }}
      />
      <Stack.Screen
        name={TripRoute.Settlements}
        component={SettlementsScreen}
        options={{ title: 'Settle Up' }}
      />
    </Stack.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing[5],
    gap: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  comingSoon: {
    marginTop: spacing[2],
  },
  button: {
    marginTop: spacing[2],
  },
});