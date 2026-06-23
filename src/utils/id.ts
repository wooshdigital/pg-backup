/**
 * Generate a pseudo-random UUID v4.
 * In production you may swap this for a native uuid library.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short human-readable ID (8 chars).
 */
export function generateShortId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}