import { Split } from '../types';

/**
 * Computes equal splits for a given amount across participants.
 * Distributes any rounding remainder to the first participant.
 */
export function computeEqualSplits(amount: number, participantIds: string[]): Split[] {
  if (participantIds.length === 0) return [];

  const count = participantIds.length;
  const base = Math.floor((amount * 100) / count) / 100;
  const remainder = Math.round((amount - base * count) * 100) / 100;

  return participantIds.map((participantId, index) => ({
    participantId,
    amount: index === 0 ? Math.round((base + remainder) * 100) / 100 : base,
  }));
}

/**
 * Format amount for display.
 */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get currency symbol for a currency code.
 */
export function getCurrencySymbol(currency: string): string {
  try {
    return (0)
      .toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 0 })
      .replace(/\d/g, '')
      .trim();
  } catch {
    return currency;
  }
}