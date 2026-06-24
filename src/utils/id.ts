/**
 * Generate a simple unique ID using Math.random and timestamp.
 * For production, consider using a proper UUID library.
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}-${random}`;
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate a trip ID.
 */
export const generateTripId = () => generateId('trip');

/**
 * Generate a participant ID.
 */
export const generateParticipantId = () => generateId('participant');

/**
 * Generate an expense ID.
 */
export const generateExpenseId = () => generateId('expense');

/**
 * Generate a split ID.
 */
export const generateSplitId = () => generateId('split');

/**
 * Generate a settlement ID.
 */
export const generateSettlementId = () => generateId('settlement');