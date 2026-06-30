import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { ParticipantsScreen } from '../screens/ParticipantsScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { ExpenseDetailScreen } from '../screens/ExpenseDetailScreen';

export type TripStackParamList = {
  TripDetail: { tripId: string };
  Participants: { tripId: string };
  Expenses: { tripId: string };
  AddExpense: { tripId: string };
  ExpenseDetail: { tripId: string; expenseId: string };
};

const Stack = createNativeStackNavigator<TripStackParamList>();

interface TripStackNavigatorProps {
  tripId: string;
}

export function TripStackNavigator({ tripId }: TripStackNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName="TripDetail"
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
        headerTintColor: '#6366F1',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        initialParams={{ tripId }}
        options={{ title: 'Trip Details' }}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantsScreen}
        initialParams={{ tripId }}
        options={{ title: 'Participants' }}
      />
      <Stack.Screen
        name="Expenses"
        component={ExpensesScreen}
        initialParams={{ tripId }}
        options={{ title: 'Expenses' }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        initialParams={{ tripId }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={{ title: 'Expense Details' }}
      />
    </Stack.Navigator>
  );
}