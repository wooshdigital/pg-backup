// ─── ID Generation ────────────────────────────────────────────────────────────

let counter = 0;

/**
 * Generates a pseudo-unique ID. For production, consider using
 * a UUID library or a crypto-based approach.
 */
export function generateId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  counter = (counter + 1) % 10000;
  const seq = counter.toString(36).padStart(3, '0');
  return `${prefix}_${timestamp}_${randomPart}_${seq}`;
}

export function generateTripId(): string {
  return generateId('trip');
}

export function generateExpenseId(): string {
  return generateId('exp');
}

export function generateParticipantId(): string {
  return generateId('part');
}

export function generateSplitId(): string {
  return generateId('split');
}