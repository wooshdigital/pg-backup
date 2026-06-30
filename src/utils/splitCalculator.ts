import { Split } from '../types';

/**
 * Computes an equal-split array for a given amount and list of participant IDs.
 * Handles rounding by adding any remainder to the first participant.
 */
export function computeEqualSplits(amount: number, participantIds: string[]): Split[] {
  if (participantIds.length === 0) return [];

  const count = participantIds.length;
  const baseAmount = Math.floor((amount / count) * 100) / 100;
  const total = parseFloat((baseAmount * count).toFixed(2));
  const remainder = parseFloat((amount - total).toFixed(2));

  return participantIds.map((participantId, index) => ({
    participantId,
    amount: index === 0 ? parseFloat((baseAmount + remainder).toFixed(2)) : baseAmount,
  }));
}

/**
 * Returns the per-person amount for an equal split (display purposes).
 */
export function getEqualShareAmount(amount: number, count: number): number {
  if (count === 0) return 0;
  return parseFloat((amount / count).toFixed(2));
}