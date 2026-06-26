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
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E0E0E0',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          textTransform: 'none',
          letterSpacing: 0.3,
        },
        tabBarActiveTintColor: '#3F51B5',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarIndicatorStyle: {
          backgroundColor: '#3F51B5',
          height: 3,
          borderRadius: 3,
        },
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="Participants" options={{ title: 'Participants' }}>
        {() => <ParticipantsScreen tripId={tripId} />}
      </Tab.Screen>
      <Tab.Screen name="Expenses" options={{ title: 'Expenses' }}>
        {() => <ExpensesPlaceholderScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}