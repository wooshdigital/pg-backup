import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { TripProvider } from './src/context/TripContext';
import { TripStackNavigator } from './src/navigation/TripStackNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <TripProvider>
        <NavigationContainer>
          <TripStackNavigator />
        </NavigationContainer>
      </TripProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});