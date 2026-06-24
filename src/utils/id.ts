// ─── ID Generation ────────────────────────────────────────────────────────────

/**
 * Generate a simple unique ID.
 * For production, consider using 'uuid' package.
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}-${random}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generate a trip ID
 */
export function generateTripId(): string {
  return generateId('trip');
}

/**
 * Generate an expense ID
 */
export function generateExpenseId(): string {
  return generateId('exp');
}

/**
 * Generate a participant ID
 */
export function generateParticipantId(): string {
  return generateId('par');
}

/**
 * Generate a split ID
 */
export function generateSplitId(): string {
  return generateId('spl');
}

/**
 * Generate a settlement ID
 */
export function generateSettlementId(): string {
  return generateId('set');
}