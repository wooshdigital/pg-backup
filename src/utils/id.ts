/**
 * Generates a pseudo-random UUID v4.
 * In production, prefer a library like `uuid` or `expo-crypto`.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a short human-readable ID (useful for display).
 * e.g. 'trip-a3f2b1'
 */
export function generateShortId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${id}` : id;
}