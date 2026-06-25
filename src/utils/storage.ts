import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';

const TRIPS_KEY = '@splitwise_clone/trips';

export async function saveTrips(trips: Trip[]): Promise<void> {
  try {
    const json = JSON.stringify(trips);
    await AsyncStorage.setItem(TRIPS_KEY, json);
  } catch (error) {
    console.error('[storage] Failed to save trips:', error);
    throw error;
  }
}

export async function loadTrips(): Promise<Trip[]> {
  try {
    const json = await AsyncStorage.getItem(TRIPS_KEY);
    if (json === null) return [];
    return JSON.parse(json) as Trip[];
  } catch (error) {
    console.error('[storage] Failed to load trips:', error);
    return [];
  }
}

export async function clearTrips(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRIPS_KEY);
  } catch (error) {
    console.error('[storage] Failed to clear trips:', error);
    throw error;
  }
}