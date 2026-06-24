import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@context/ThemeContext';
import { HomeScreen } from '@screens/HomeScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { TripStackNavigator } from './TripStackNavigator';
import { RootTab } from '@constants/routes';
import { typography } from '@constants/theme';
import type { RootTabParamList } from '@types/index';

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

// ─── Tab Icons ────────────────────────────────────────────────────────────────

function tabIcon(routeName: string, focused: boolean): string {
  switch (routeName) {
    case RootTab.Home:
      return focused ? '🏠' : '🏡';
    case RootTab.Trips:
      return focused ? '✈️' : '🛫';
    case RootTab.Settings:
      return focused ? '⚙️' : '🔧';
    default:
      return '●';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RootNavigator(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={RootTab.Home}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopColor: theme.colors.border,
          },
        ],
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          // Using Text component for emoji icons as a placeholder
          // In production, replace with a proper icon library (e.g. @expo/vector-icons)
          return (
            <React.Fragment>
              {/* Emoji icon */}
              {/* Note: This renders as the tabBarLabel overrides this in RN —
                  see tabBarIcon replacement below with a simple marker */}
            </React.Fragment>
          );
        },
        // Simple dot indicator for active tab as a placeholder
        tabBarBadge: undefined,
        // Custom tab bar label that includes an emoji
        tabBarLabel: ({ focused, color }) => {
          const icon = tabIcon(route.name, focused);
          const label =
            route.name === RootTab.Home
              ? 'Home'
              : route.name === RootTab.Trips
                ? 'Trips'
                : 'Settings';
          return `${icon} ${label}`;
        },
      })}
    >
      <Tab.Screen
        name={RootTab.Home}
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name={RootTab.Trips}
        component={TripStackNavigator}
        options={{ title: 'Trips' }}
      />
      <Tab.Screen
        name={RootTab.Settings}
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});