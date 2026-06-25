import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAsyncStorageReturn<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
}

export function useAsyncStorage<T>(key: string, initialValue?: T): UseAsyncStorageReturn<T> {
  const [value, setValue_] = useState<T | null>(initialValue ?? null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const json = await AsyncStorage.getItem(key);
        if (!cancelled) {
          if (json !== null) {
            setValue_(JSON.parse(json) as T);
          } else if (initialValue !== undefined) {
            setValue_(initialValue);
          }
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [key]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        const json = JSON.stringify(newValue);
        await AsyncStorage.setItem(key, json);
        setValue_(newValue);
        setError(null);
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
      setValue_(null);
      setError(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, [key]);

  return { value, loading, error, setValue, removeValue };
}