import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripStackNavigator } from './TripStackNavigator';
import { RootRoute } from '../constants/routes';
import { Body } from '../components/common/Typography';
import { borderRadius, shadows, spacing } from '../constants/theme';
import type { RootTabParamList } from '../types';

// ─── Tab Config ───────────────────────────────────────────────────────────────

interface TabConfig {
  route: RootRoute;
  emoji: string;
  label: string;
}

const TAB_CONFIG: TabConfig[] = [
  { route: RootRoute.Home, emoji: '🏠', label: 'Home' },
  { route: RootRoute.Trips, emoji: '✈️', label: 'Trips' },
  { route: RootRoute.Settings, emoji: '⚙️', label: 'Settings' },
];

// ─── Tab Icon ─────────────────────────────────────────────────────────────────

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Body style={styles.tabEmoji}>{emoji}</Body>
      <Body
        style={[
          styles.tabLabel,
          { color: focused ? theme.primary : theme.textTertiary },
          focused && styles.tabLabelFocused,
        ]}
      >
        {label}
      </Body>
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          ...shadows.sm,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name={RootRoute.Home}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name={RootRoute.Trips}
        component={TripStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✈️" label="Trips" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name={RootRoute.Settings}
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="Settings" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
  },
  tabIconFocused: {
    // subtle indicator
  },
  tabEmoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
});