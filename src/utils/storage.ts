import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';

const TRIPS_STORAGE_KEY = '@splitmate/trips';

export const saveTrips = async (trips: Trip[]): Promise<void> => {
  try {
    const json = JSON.stringify(trips);
    await AsyncStorage.setItem(TRIPS_STORAGE_KEY, json);
  } catch (error) {
    console.error('[storage] Failed to save trips:', error);
    throw error;
  }
};

export const loadTrips = async (): Promise<Trip[]> => {
  try {
    const json = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
    if (json === null) return [];
    return JSON.parse(json) as Trip[];
  } catch (error) {
    console.error('[storage] Failed to load trips:', error);
    return [];
  }
};

export const clearTrips = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TRIPS_STORAGE_KEY);
  } catch (error) {
    console.error('[storage] Failed to clear trips:', error);
    throw error;
  }
};