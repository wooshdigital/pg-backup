import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParticipantsScreen } from '../screens/ParticipantsScreen';
import { ExpensesPlaceholderScreen } from '../screens/ExpensesPlaceholderScreen';

const Tab = createMaterialTopTabNavigator();

interface TripDetailTabsProps {
  tripId: string;
  tripName: string;
}

// Wrapper components to inject tripId prop
function ParticipantsTab({ route }: any) {
  const tripId = route.params?.tripId;
  return <ParticipantsScreen tripId={tripId} />;
}

function ExpensesTab() {
  return <ExpensesPlaceholderScreen />;
}

export function TripDetailTabs({ tripId, tripName }: TripDetailTabsProps) {
  return (
    <Tab.Navigator
      initialRouteName="Participants"
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIndicatorStyle: {
          backgroundColor: '#007AFF',
          height: 3,
          borderRadius: 2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
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
        component={ParticipantsTab}
        initialParams={{ tripId }}
        options={{ title: 'Participants' }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesTab}
        options={{ title: 'Expenses' }}
      />
    </Tab.Navigator>
  );
}

export default TripDetailTabs;