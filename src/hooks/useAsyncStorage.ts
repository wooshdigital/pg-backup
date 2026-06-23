import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseAsyncStorageReturn<T> {
  value: T | null;
  isLoading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Persistent state backed by AsyncStorage.
 * Automatically loads the value on mount and serialises/deserialises JSON.
 */
export function useAsyncStorage<T>(key: string, defaultValue?: T): UseAsyncStorageReturn<T> {
  const [value, setValueState] = useState<T | null>(defaultValue ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw !== null) {
        setValueState(JSON.parse(raw) as T);
      } else if (defaultValue !== undefined) {
        setValueState(defaultValue);
      } else {
        setValueState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [key, defaultValue]);

  useEffect(() => {
    void load();
  }, [load]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
        setValueState(newValue);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [key]
  );

  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValueState(defaultValue ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [key, defaultValue]);

  return { value, isLoading, error, setValue, removeValue, refresh: load };
}