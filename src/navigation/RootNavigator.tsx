import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripStackNavigator } from './TripStackNavigator';
import { useTheme } from '../context/ThemeContext';
import { Body } from '../components/common/Typography';
import { RootRoutes, type RootTabParamList } from '../constants/routes';

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

// ─── Tab Icon ─────────────────────────────────────────────────────────────────

interface TabIconProps {
  emoji: string;
  focused: boolean;
}

function TabIcon({ emoji, focused }: TabIconProps) {
  return (
    <Body size="lg" style={focused ? styles.tabIconFocused : styles.tabIcon}>
      {emoji}
    </Body>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

// ─── Root Navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name={RootRoutes.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name={RootRoutes.TRIPS}
        component={TripStackNavigator}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✈️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name={RootRoutes.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}