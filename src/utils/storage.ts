import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';

const TRIPS_KEY = '@splitwise_trips';

export async function saveTrips(trips: Trip[]): Promise<void> {
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export async function loadTrips(): Promise<Trip[]> {
  const raw = await AsyncStorage.getItem(TRIPS_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as Trip[];
  // Ensure backward compat: every trip has expenses array
  return parsed.map((t) => ({ ...t, expenses: t.expenses || [] }));
}