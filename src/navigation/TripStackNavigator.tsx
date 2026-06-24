import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { TripStack, TripStackParamList } from '../constants/routes';
import { TripsScreen } from '../screens/TripsScreen';

const Stack = createStackNavigator<TripStackParamList>();

// Placeholder screens for routes not yet implemented
const PlaceholderScreen: React.FC<{ route: { name: string } }> = ({ route }) => {
  const { View, Text } = require('react-native');
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.primary,
      }}
    >
      <Text style={{ color: theme.colors.text.primary, fontSize: 18 }}>
        {route.name}
      </Text>
      <Text style={{ color: theme.colors.text.secondary, fontSize: 14, marginTop: 8 }}>
        Coming soon...
      </Text>
    </View>
  );
};

export const TripStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface.primary,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.semibold,
          fontSize: theme.fontSize.lg,
          color: theme.colors.text.primary,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name={TripStack.TripsList}
        component={TripsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={TripStack.TripDetail}
        component={PlaceholderScreen}
        options={{ title: 'Trip Details' }}
      />
      <Stack.Screen
        name={TripStack.TripCreate}
        component={PlaceholderScreen}
        options={{ title: 'New Trip' }}
      />
      <Stack.Screen
        name={TripStack.TripEdit}
        component={PlaceholderScreen}
        options={{ title: 'Edit Trip' }}
      />
      <Stack.Screen
        name={TripStack.ExpenseDetail}
        component={PlaceholderScreen}
        options={{ title: 'Expense Details' }}
      />
      <Stack.Screen
        name={TripStack.ExpenseCreate}
        component={PlaceholderScreen}
        options={{ title: 'Add Expense' }}
      />
      <Stack.Screen
        name={TripStack.ExpenseEdit}
        component={PlaceholderScreen}
        options={{ title: 'Edit Expense' }}
      />
      <Stack.Screen
        name={TripStack.ParticipantDetail}
        component={PlaceholderScreen}
        options={{ title: 'Participant' }}
      />
      <Stack.Screen
        name={TripStack.Settlements}
        component={PlaceholderScreen}
        options={{ title: 'Settlements' }}
      />
    </Stack.Navigator>
  );
};