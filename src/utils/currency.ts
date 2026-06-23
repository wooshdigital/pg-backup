import type { CurrencyCode } from '../types';

// ─── Currency Metadata ────────────────────────────────────────────────────────

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; decimalPlaces: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { symbol: 'AU$', name: 'Australian Dollar', decimalPlaces: 2 },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', decimalPlaces: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', decimalPlaces: 2 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
  KRW: { symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2 },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2 },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2 },
  ZAR: { symbol: 'R', name: 'South African Rand', decimalPlaces: 2 },
  THB: { symbol: '฿', name: 'Thai Baht', decimalPlaces: 2 },
};

/**
 * Format an amount (in minor units / cents) as a display string.
 * e.g. formatCurrency(1050, 'USD') => '$10.50'
 */
export function formatCurrency(amountInMinorUnits: number, currency: CurrencyCode): string {
  const meta = CURRENCIES[currency];
  const amount = amountInMinorUnits / Math.pow(10, meta.decimalPlaces);
  const symbol = meta.symbol;

  if (meta.decimalPlaces === 0) {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${symbol}${amount.toFixed(meta.decimalPlaces)}`;
}

/**
 * Convert a display string (e.g. "10.50") to minor units.
 */
export function toMinorUnits(amount: number, currency: CurrencyCode): number {
  const meta = CURRENCIES[currency];
  return Math.round(amount * Math.pow(10, meta.decimalPlaces));
}

/**
 * Convert minor units back to a decimal number.
 */
export function fromMinorUnits(amountInMinorUnits: number, currency: CurrencyCode): number {
  const meta = CURRENCIES[currency];
  return amountInMinorUnits / Math.pow(10, meta.decimalPlaces);
}