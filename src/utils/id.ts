/**
 * Generate a simple unique ID using Math.random and timestamp.
 * In production, consider using a proper UUID library.
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}-${randomPart}`;
  return prefix ? `${prefix}_${id}` : id;
}