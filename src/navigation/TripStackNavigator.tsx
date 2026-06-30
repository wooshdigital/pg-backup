import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text, StyleSheet } from 'react-native';
import { RootStackParamList } from '../types';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { ExpenseDetailScreen } from '../screens/ExpenseDetailScreen';
import { CreateTripScreen } from '../screens/CreateTripScreen';
import { ParticipantsScreen } from '../screens/ParticipantsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function TripStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6366F1' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        contentStyle: { backgroundColor: '#F3F4F6' },
      }}
    >
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={({ navigation, route }) => ({
          title: 'Trip Details',
          headerBackTitle: 'Trips',
        })}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          title: 'Add Expense',
          presentation: 'modal',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#6366F1',
          headerTitleStyle: { fontWeight: '700', color: '#111827' },
        }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={{
          title: 'Expense Detail',
          headerBackTitle: 'Back',
          headerTransparent: true,
          headerTintColor: '#FFFFFF',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          title: 'New Trip',
          presentation: 'modal',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#6366F1',
          headerTitleStyle: { fontWeight: '700', color: '#111827' },
        }}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantsScreen}
        options={{
          title: 'Participants',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 4,
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TripStackNavigator;