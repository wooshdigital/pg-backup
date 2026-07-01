export interface Split {
  participantId: string;
  amount: number;
}

/**
 * Round a currency value to 2 decimal places
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate equal splits for a list of participants
 */
export function calculateEqualSplits(
  participantIds: string[],
  total: number
): Split[] {
  if (participantIds.length === 0) return [];

  const baseAmount = roundCurrency(Math.floor((total / participantIds.length) * 100) / 100);
  const remainder = roundCurrency(total - baseAmount * participantIds.length);

  return participantIds.map((participantId, index) => ({
    participantId,
    amount: index === participantIds.length - 1
      ? roundCurrency(baseAmount + remainder)
      : baseAmount,
  }));
}

/**
 * Validate that custom splits sum to the total amount
 * Returns null if valid, or an error message
 */
export function validateCustomSplits(splits: Split[], total: number): string | null {
  const sum = roundCurrency(splits.reduce((acc, s) => acc + s.amount, 0));
  const roundedTotal = roundCurrency(total);

  if (Math.abs(sum - roundedTotal) > 0.001) {
    const diff = roundCurrency(roundedTotal - sum);
    if (diff > 0) {
      return `${diff.toFixed(2)} unassigned`;
    } else {
      return `${Math.abs(diff).toFixed(2)} over-assigned`;
    }
  }

  return null;
}

/**
 * Get the unassigned amount (positive = unassigned, negative = over-assigned)
 */
export function getUnassignedAmount(splits: Split[], total: number): number {
  const sum = roundCurrency(splits.reduce((acc, s) => acc + s.amount, 0));
  return roundCurrency(total - sum);
}

/**
 * Adjust the last participant's share so the total is exact (handles floating-point rounding)
 */
export function adjustLastParticipant(splits: Split[], total: number): Split[] {
  if (splits.length === 0) return splits;

  const allButLast = splits.slice(0, -1);
  const sumAllButLast = roundCurrency(allButLast.reduce((acc, s) => acc + s.amount, 0));
  const lastAmount = roundCurrency(total - sumAllButLast);

  return [
    ...allButLast,
    {
      ...splits[splits.length - 1],
      amount: lastAmount,
    },
  ];
}

/**
 * Initialize custom splits from equal splits or existing splits
 */
export function initializeCustomSplits(
  participantIds: string[],
  total: number,
  existingSplits?: Split[]
): Split[] {
  if (existingSplits && existingSplits.length > 0) {
    // Use existing splits but ensure all participants are included
    const existing = new Map(existingSplits.map(s => [s.participantId, s.amount]));
    return participantIds.map(id => ({
      participantId: id,
      amount: existing.get(id) ?? 0,
    }));
  }
  return calculateEqualSplits(participantIds, total);
}