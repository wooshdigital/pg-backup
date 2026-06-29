import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParticipantsScreen } from '../screens/ParticipantsScreen';
import { ExpensesPlaceholderScreen } from '../screens/ExpensesPlaceholderScreen';
import { TripDetailTabParamList } from '../types';

const Tab = createMaterialTopTabNavigator<TripDetailTabParamList>();

interface TripDetailTabsProps {
  tripId: string;
  tripName: string;
}

export function TripDetailTabs({ tripId, tripName }: TripDetailTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIndicatorStyle: {
          backgroundColor: '#007AFF',
          height: 2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarPressColor: '#E5F1FF',
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
        initialParams={{ tripId }}
        options={{ tabBarLabel: 'Expenses' }}
      />
    </Tab.Navigator>
  );
}

export default TripDetailTabs;