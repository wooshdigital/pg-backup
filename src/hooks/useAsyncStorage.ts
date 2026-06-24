import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UseAsyncStorageReturn<T> {
  value: T | null;
  isLoading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAsyncStorage<T>(key: string, defaultValue?: T): UseAsyncStorageReturn<T> {
  const [value, setValueState] = useState<T | null>(defaultValue ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const raw = await AsyncStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        setValueState(parsed);
      } else {
        setValueState(defaultValue ?? null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.warn(`useAsyncStorage: Failed to load key "${key}"`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, defaultValue]);

  useEffect(() => {
    load();
  }, [load]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        setError(null);
        const serialized = JSON.stringify(newValue);
        await AsyncStorage.setItem(key, serialized);
        setValueState(newValue);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.warn(`useAsyncStorage: Failed to set key "${key}"`, error);
        throw error;
      }
    },
    [key],
  );

  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setValueState(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.warn(`useAsyncStorage: Failed to remove key "${key}"`, error);
      throw error;
    }
  }, [key]);

  return {
    value,
    isLoading,
    error,
    setValue,
    removeValue,
    refresh: load,
  };
}