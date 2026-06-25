import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAsyncStorageResult<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
}

export function useAsyncStorage<T>(key: string): UseAsyncStorageResult<T> {
  const [value, setValue_] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    AsyncStorage.getItem(key)
      .then((json) => {
        if (cancelled) return;
        if (json !== null) {
          setValue_(JSON.parse(json) as T);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
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
        setValue_(newValue);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [key]
  );

  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValue_(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [key]);

  return { value, loading, error, setValue, removeValue };
}