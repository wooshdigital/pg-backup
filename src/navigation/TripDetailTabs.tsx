import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParticipantsScreen } from '../screens/ParticipantsScreen';
import { ExpensesPlaceholderScreen } from '../screens/ExpensesPlaceholderScreen';
import { TripDetailTabParamList } from '../types';

const Tab = createMaterialTopTabNavigator<TripDetailTabParamList>();

interface TripDetailTabsProps {
  tripId: string;
}

export function TripDetailTabs({ tripId }: TripDetailTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIndicatorStyle: {
          backgroundColor: '#6366F1',
          height: 3,
          borderRadius: 2,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          textTransform: 'none',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
      }}
    >
      <Tab.Screen
        name="Participants"
        component={ParticipantsScreen}
        initialParams={{ tripId }}
        options={{ title: 'Participants' }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesPlaceholderScreen}
        initialParams={{ tripId }}
        options={{ title: 'Expenses' }}
      />
    </Tab.Navigator>
  );
}