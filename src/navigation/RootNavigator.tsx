import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripStackNavigator } from './TripStackNavigator';
import { useTheme } from '../context/ThemeContext';
import { RootRoute } from '../constants/routes';
import { typography, borderRadius, shadows } from '../constants/theme';
import type { RootTabParamList } from '../types';

// ─── Tab Icon ─────────────────────────────────────────────────────────────────

interface TabIconProps {
  emoji: string;
  focused: boolean;
  color: string;
}

function TabIcon({ emoji, focused, color: _color }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: focused ? 26 : 22,
          opacity: focused ? 1 : 0.6,
        }}
      >
        {emoji}
      </Text>
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={RootRoute.HOME}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          ...shadows.sm,
          shadowColor: colors.shadow,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: borderRadius.md,
          marginHorizontal: 4,
        },
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? colors.surface : colors.surface,
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name={RootRoute.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={RootRoute.TRIPS}
        component={TripStackNavigator}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="✈️" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={RootRoute.SETTINGS}
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

export default RootNavigator;