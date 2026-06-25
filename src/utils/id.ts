let counter = 0;

/**
 * Generates a stable, unique ID string with an optional prefix.
 * Uses an incrementing counter for SSR-safe ID generation.
 * In React 18+, prefer useId() hook instead when inside components.
 */
export function generateId(prefix = 'id'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Resets the counter — for use in tests only.
 */
export function resetIdCounter(): void {
  counter = 0;
}