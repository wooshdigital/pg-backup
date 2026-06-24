import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A hook that persists state in AsyncStorage.
 * Returns [storedValue, setValue] similar to useState.
 */
export function useAsyncStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => Promise<void>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load persisted value on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (!cancelled && item !== null) {
          setStoredValue(JSON.parse(item) as T);
        }
      } catch (error) {
        console.warn(`[useAsyncStorage] Failed to load key "${key}":`, error);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const setValue = useCallback(
    async (value: T): Promise<void> => {
      try {
        setStoredValue(value);
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`[useAsyncStorage] Failed to save key "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}