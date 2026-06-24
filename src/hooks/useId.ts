import { useMemo } from 'react';

let counter = 0;

/**
 * Generates a stable unique ID for the lifetime of the component.
 * Useful for linking accessibility labels (e.g., aria-labelledby).
 */
export function useId(prefix = 'id'): string {
  return useMemo(() => {
    counter += 1;
    return `${prefix}-${counter}`;
  }, [prefix]);
}