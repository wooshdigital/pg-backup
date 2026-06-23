import type { CurrencyCode } from '../types';

// ─── Currency metadata ────────────────────────────────────────────────────────

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; decimalPlaces: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', decimalPlaces: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
};

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Format a numeric amount as a currency string.
 * e.g. formatCurrency(1234.5, 'USD') → '$1,234.50'
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const { decimalPlaces } = CURRENCIES[currencyCode];
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(amount);
  } catch {
    const { symbol } = CURRENCIES[currencyCode];
    return `${symbol}${amount.toFixed(decimalPlaces)}`;
  }
}

/**
 * Format a currency symbol only.
 */
export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol;
}

/**
 * Parse a numeric string to a fixed-precision number for a given currency.
 */
export function parseCurrencyAmount(raw: string, currencyCode: CurrencyCode): number {
  const { decimalPlaces } = CURRENCIES[currencyCode];
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return parseFloat(parsed.toFixed(decimalPlaces));
}