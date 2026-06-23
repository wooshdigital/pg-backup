import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseAsyncStorageReturn<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAsyncStorage<T>(key: string, initialValue?: T): UseAsyncStorageReturn<T> {
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
      setError(err instanceof Error ? err : new Error(String(err)));
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
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
        setValueState(newValue);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [key],
  );

  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValueState(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
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