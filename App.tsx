import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { TripProvider } from './src/context/TripContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <TripProvider>
        <RootNavigator />
      </TripProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});