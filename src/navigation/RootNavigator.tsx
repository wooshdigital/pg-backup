import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TripStackNavigator } from './TripStackNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export function RootNavigator() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <TripStackNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});