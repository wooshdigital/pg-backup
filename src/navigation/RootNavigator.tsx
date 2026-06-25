import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { TripStackNavigator } from './TripStackNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootTabParamList = {
  TripsTab: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            borderTopColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Tab.Screen
          name="TripsTab"
          component={TripStackNavigator}
          options={{
            title: 'Trips',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size - 4, color }}>✈️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size - 4, color }}>⚙️</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};