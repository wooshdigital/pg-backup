import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { RootTab, RootTabParamList } from '../constants/routes';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripStackNavigator } from './TripStackNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Simple inline icons using emoji for now (will be replaced with a proper icon library)
interface TabIconProps {
  focused: boolean;
  emoji: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, emoji }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.tabIconContainer}>
      <Text
        style={[
          styles.tabIconEmoji,
          { opacity: focused ? 1 : 0.5 },
          focused && { transform: [{ scale: 1.1 }] },
        ]}
      >
        {emoji}
      </Text>
      {focused && (
        <View
          style={[
            styles.tabIconDot,
            { backgroundColor: theme.colors.brand.primary },
          ]}
        />
      )}
    </View>
  );
};

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface.primary,
          borderTopColor: theme.colors.border.subtle,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name={RootTab.Home}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🏠" />,
        }}
      />
      <Tab.Screen
        name={RootTab.Trips}
        component={TripStackNavigator}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="✈️" />,
        }}
      />
      <Tab.Screen
        name={RootTab.Settings}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="⚙️" />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconEmoji: {
    fontSize: 22,
  },
  tabIconDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});