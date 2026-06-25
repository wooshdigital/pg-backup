import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAsyncStorageResult<T> {
  value: T | null;
  isLoading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
}

/**
 * Generic hook for reading/writing JSON values to AsyncStorage.
 */
export function useAsyncStorage<T>(key: string): UseAsyncStorageResult<T> {
  const [value, setValueState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    AsyncStorage.getItem(key)
      .then((json) => {
        if (cancelled) return;
        if (json !== null) {
          setValueState(JSON.parse(json) as T);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        const json = JSON.stringify(newValue);
        await AsyncStorage.setItem(key, json);
        setValueState(newValue);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      }
    },
    [key],
  );

  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValueState(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, [key]);

  return { value, isLoading, error, setValue, removeValue };
}