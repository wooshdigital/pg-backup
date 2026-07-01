export interface ParticipantSplit {
  participantId: string;
  amount: number;
}

/**
 * Rounds a currency value to 2 decimal places using banker's rounding workaround.
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates equal splits for a list of participant IDs.
 */
export function calculateEqualSplits(
  participantIds: string[],
  total: number
): ParticipantSplit[] {
  if (participantIds.length === 0) return [];

  const baseAmount = roundCurrency(Math.floor((total / participantIds.length) * 100) / 100);
  const remainder = roundCurrency(total - baseAmount * participantIds.length);

  return participantIds.map((id, index) => ({
    participantId: id,
    amount: index === participantIds.length - 1
      ? roundCurrency(baseAmount + remainder)
      : baseAmount,
  }));
}

/**
 * Validates that custom splits sum to the total amount.
 * Returns an object with isValid flag and the difference.
 */
export function validateCustomSplits(
  splits: ParticipantSplit[],
  total: number
): { isValid: boolean; difference: number } {
  const sum = splits.reduce((acc, s) => acc + (s.amount || 0), 0);
  const difference = roundCurrency(total - sum);
  return {
    isValid: Math.abs(difference) < 0.001,
    difference,
  };
}

/**
 * Auto-adjusts the last participant's share to make splits sum exactly to total.
 * Handles floating-point rounding issues.
 */
export function adjustLastParticipant(
  splits: ParticipantSplit[],
  total: number
): ParticipantSplit[] {
  if (splits.length === 0) return splits;

  const allButLast = splits.slice(0, -1);
  const sumOfOthers = allButLast.reduce((acc, s) => acc + (s.amount || 0), 0);
  const lastAmount = roundCurrency(total - sumOfOthers);

  return [
    ...allButLast,
    { ...splits[splits.length - 1], amount: lastAmount },
  ];
}

/**
 * Creates an initial custom splits map with zero amounts for each participant.
 */
export function createInitialCustomSplits(participantIds: string[]): ParticipantSplit[] {
  return participantIds.map((id) => ({ participantId: id, amount: 0 }));
}