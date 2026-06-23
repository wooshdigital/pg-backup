import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripStackNavigator } from './TripStackNavigator';
import { useTheme } from '../context/ThemeContext';
import { TabRoute, type RootTabParamList } from '../constants/routes';

// ─── Tab Icon ─────────────────────────────────────────────────────────────────

interface TabIconProps {
  emoji: string;
  focused: boolean;
  color: string;
}

function TabIcon({ emoji, focused }: TabIconProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
      }}
    >
      <Text style={{ fontSize: focused ? 24 : 22 }}>{emoji}</Text>
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={TabRoute.Home}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name={TabRoute.Home}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoute.Trips}
        component={TripStackNavigator}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="✈️" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoute.Settings}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}