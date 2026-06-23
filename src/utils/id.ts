/**
 * Generate a UUID v4-like unique identifier.
 * Falls back to a timestamp-based ID if crypto is unavailable.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: timestamp + random
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 9) +
    Math.random().toString(36).substring(2, 9)
  );
}