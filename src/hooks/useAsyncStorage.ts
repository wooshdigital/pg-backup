import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseAsyncStorageResult<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (value: T) => Promise<void>;
  removeValue: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAsyncStorage<T>(key: string, initialValue?: T): UseAsyncStorageResult<T> {
  const [value, setValueState] = useState<T | null>(initialValue ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(key);
      if (stored !== null) {
        setValueState(JSON.parse(stored) as T);
      } else if (initialValue !== undefined) {
        setValueState(initialValue);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.warn(`useAsyncStorage: Failed to load key "${key}"`, error);
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  useEffect(() => {
    void load();
  }, [load]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        setError(null);
        setValueState(newValue);
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
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
      setValueState(null);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.warn(`useAsyncStorage: Failed to remove key "${key}"`, error);
      throw error;
    }
  }, [key]);

  return {
    value,
    loading,
    error,
    setValue,
    removeValue,
    refresh: load,
  };
}