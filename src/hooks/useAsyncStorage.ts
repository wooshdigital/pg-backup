import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAsyncStorageReturn<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
}

/**
 * Hook for reading and writing a JSON-serializable value to AsyncStorage.
 */
export function useAsyncStorage<T>(key: string, initialValue?: T): UseAsyncStorageReturn<T> {
  const [value, setValue_] = useState<T | null>(initialValue ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const stored = await AsyncStorage.getItem(key);
        if (stored !== null) {
          setValue_(JSON.parse(stored) as T);
        } else if (initialValue !== undefined) {
          setValue_(initialValue);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
        setValue_(newValue);
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
      setValue_(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [key]);

  return { value, loading, error, setValue, removeValue };
}