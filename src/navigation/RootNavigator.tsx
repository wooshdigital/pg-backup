import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripStackNavigator } from './TripStackNavigator';
import { RootRoutes } from '../constants/routes';
import type { RootTabParamList } from '../types';

// ─── Tab ──────────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

// ─── Tab Icons ────────────────────────────────────────────────────────────────

interface TabIconProps {
  emoji: string;
  focused: boolean;
  color: string;
}

function TabIcon({ emoji, focused, color: _color }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 26 : 22 }}>{emoji}</Text>
    </View>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={RootRoutes.Home}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textDisabled,
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.bold,
          fontSize: theme.typography.fontSize.lg,
        },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name={RootRoutes.Home}
        component={HomeScreen}
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={RootRoutes.Trips}
        component={TripStackNavigator}
        options={{
          headerShown: false,
          title: 'Trips',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="✈️" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={RootRoutes.Settings}
        component={SettingsScreen}
        options={{
          headerShown: false,
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}