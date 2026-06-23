import type { CurrencyCode, Money } from '../types';

// ─── Currency Registry ───────────────────────────────────────────────────────

export const CURRENCIES: Record<string, { symbol: string; name: string; decimalPlaces: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimalPlaces: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', decimalPlaces: 2 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
  KRW: { symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2 },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2 },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2 },
  THB: { symbol: '฿', name: 'Thai Baht', decimalPlaces: 2 },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimalPlaces: 0 },
};

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Format a money value (in smallest unit, e.g. cents) to a display string.
 */
export function formatMoney(money: Money, locale = 'en-US'): string {
  const currency = CURRENCIES[money.currency];
  const decimalPlaces = currency?.decimalPlaces ?? 2;
  const humanAmount = money.amount / Math.pow(10, decimalPlaces);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(humanAmount);
  } catch {
    const symbol = currency?.symbol ?? money.currency;
    return `${symbol}${humanAmount.toFixed(decimalPlaces)}`;
  }
}

/**
 * Convert a decimal amount to smallest currency unit (e.g. dollars → cents).
 */
export function toSmallestUnit(amount: number, currencyCode: CurrencyCode): number {
  const currency = CURRENCIES[currencyCode];
  const decimalPlaces = currency?.decimalPlaces ?? 2;
  return Math.round(amount * Math.pow(10, decimalPlaces));
}

/**
 * Convert smallest unit to decimal amount.
 */
export function fromSmallestUnit(amount: number, currencyCode: CurrencyCode): number {
  const currency = CURRENCIES[currencyCode];
  const decimalPlaces = currency?.decimalPlaces ?? 2;
  return amount / Math.pow(10, decimalPlaces);
}

/**
 * Get currency symbol for a currency code.
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code]?.symbol ?? code;
}