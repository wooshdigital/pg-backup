/**
 * Generates a simple unique identifier.
 * Uses crypto.randomUUID when available (React Native 0.73+),
 * otherwise falls back to a timestamp + random string.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}