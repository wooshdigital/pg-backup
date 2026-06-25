import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';

const TRIPS_KEY = '@splitmate/trips';

export async function saveTrips(trips: Trip[]): Promise<void> {
  try {
    const json = JSON.stringify(trips);
    await AsyncStorage.setItem(TRIPS_KEY, json);
  } catch (error) {
    console.error('[storage] saveTrips error:', error);
    throw error;
  }
}

export async function loadTrips(): Promise<Trip[]> {
  try {
    const json = await AsyncStorage.getItem(TRIPS_KEY);
    if (json === null) return [];
    return JSON.parse(json) as Trip[];
  } catch (error) {
    console.error('[storage] loadTrips error:', error);
    return [];
  }
}

export async function clearTrips(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRIPS_KEY);
  } catch (error) {
    console.error('[storage] clearTrips error:', error);
    throw error;
  }
}