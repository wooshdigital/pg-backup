import type { CurrencyCode } from '../types';

/**
 * Format a number as currency string.
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode,
  locale = 'en-US',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Round a number to a given number of decimal places.
 */
export function roundToDecimalPlaces(value: number, places = 2): number {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate the percentage of an amount.
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return roundToDecimalPlaces((amount * percentage) / 100);
}