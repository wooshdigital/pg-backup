import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';

const TRIPS_KEY = '@splitease/trips';

export async function loadTrips(): Promise<Trip[]> {
  try {
    const raw = await AsyncStorage.getItem(TRIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Trip[];
    return parsed.map((t) => ({ ...t, participants: t.participants ?? [] }));
  } catch {
    return [];
  }
}

export async function saveTrips(trips: Trip[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch {
    // silently fail
  }
}