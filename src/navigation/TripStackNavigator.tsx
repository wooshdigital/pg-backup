import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { ExpenseDetailScreen } from '../screens/ExpenseDetailScreen';
import { ParticipantsScreen } from '../screens/ParticipantsScreen';

export type TripStackParamList = {
  TripDetail: { tripId: string };
  Expenses: { tripId: string };
  AddExpense: { tripId: string };
  ExpenseDetail: { tripId: string; expenseId: string };
  Participants: { tripId: string };
};

const Stack = createNativeStackNavigator<TripStackParamList>();

export function TripStackNavigator({ route }: { route: any }) {
  const { tripId } = route.params;

  return (
    <Stack.Navigator
      initialRouteName="TripDetail"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        initialParams={{ tripId }}
      />
      <Stack.Screen
        name="Expenses"
        component={ExpensesScreen}
        initialParams={{ tripId }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantsScreen}
      />
    </Stack.Navigator>
  );
}