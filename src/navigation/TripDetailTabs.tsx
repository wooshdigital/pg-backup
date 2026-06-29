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
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIndicatorStyle: {
          backgroundColor: '#007AFF',
          height: 3,
          borderRadius: 1.5,
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
          textTransform: 'capitalize',
        },
        lazy: true,
      }}
    >
      <Tab.Screen
        name="Participants"
        component={ParticipantsScreen}
        initialParams={{ tripId }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesPlaceholderScreen}
        initialParams={{ tripId }}
      />
    </Tab.Navigator>
  );
}

export default TripDetailTabs;