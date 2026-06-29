import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParticipantsScreen } from '../screens/ParticipantsScreen';
import { ExpensesPlaceholderScreen } from '../screens/ExpensesPlaceholderScreen';

const Tab = createMaterialTopTabNavigator();

interface TripDetailTabsProps {
  tripId: string;
}

export function TripDetailTabs({ tripId }: TripDetailTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIndicatorStyle: {
          backgroundColor: '#6C63FF',
          height: 3,
          borderRadius: 2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 14,
          textTransform: 'none',
        },
      }}
    >
      <Tab.Screen
        name="Participants"
        component={ParticipantsScreen}
        initialParams={{ tripId }}
        options={{ tabBarLabel: 'Participants' }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesPlaceholderScreen}
        options={{ tabBarLabel: 'Expenses' }}
      />
    </Tab.Navigator>
  );
}