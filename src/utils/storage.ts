import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';

const TRIPS_KEY = '@splitwise_trips';

export async function saveTrips(trips: Trip[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Failed to save trips:', error);
  }
}

export async function loadTrips(): Promise<Trip[]> {
  try {
    const data = await AsyncStorage.getItem(TRIPS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    // Ensure all trips have an expenses array (migration for older data)
    return parsed.map((trip: Trip) => ({
      ...trip,
      expenses: trip.expenses || [],
      participants: trip.participants || [],
    }));
  } catch (error) {
    console.error('Failed to load trips:', error);
    return [];
  }
}

export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRIPS_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}