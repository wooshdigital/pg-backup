import { Split } from '../types';

/**
 * Computes an equal split array given a total amount and list of participant IDs.
 * Distributes remainder cents to the first participants to ensure the total is exact.
 */
export function computeEqualSplits(amount: number, participantIds: string[]): Split[] {
  if (participantIds.length === 0) return [];

  const count = participantIds.length;
  // Work in integer cents to avoid floating point issues
  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents - baseCents * count;

  return participantIds.map((participantId, index) => ({
    participantId,
    amount: parseFloat(((baseCents + (index < remainder ? 1 : 0)) / 100).toFixed(2)),
  }));
}

/**
 * Returns the per-person amount for an equal split (for display purposes).
 */
export function getEqualShareAmount(amount: number, count: number): number {
  if (count === 0) return 0;
  return parseFloat((amount / count).toFixed(2));
}

/**
 * Validates that splits sum to the total amount.
 */
export function validateSplits(amount: number, splits: Split[]): boolean {
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  return Math.abs(total - amount) < 0.01;
}