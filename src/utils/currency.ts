import type { CurrencyCode } from '@types/index';

const CURRENCY_META: Record<CurrencyCode, { symbol: string; name: string; decimalPlaces: number }> =
  {
    USD: { symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
    EUR: { symbol: '€', name: 'Euro', decimalPlaces: 2 },
    GBP: { symbol: '£', name: 'British Pound', decimalPlaces: 2 },
    JPY: { symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
    AUD: { symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
    CHF: { symbol: 'Fr', name: 'Swiss Franc', decimalPlaces: 2 },
    CNY: { symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
    INR: { symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
    MXN: { symbol: 'MX$', name: 'Mexican Peso', decimalPlaces: 2 },
    BRL: { symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
    KRW: { symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  };

/**
 * Formats an amount (in smallest currency unit, e.g. cents) to a display string.
 * e.g. formatCurrency(1234, 'USD') => '$12.34'
 */
export function formatCurrency(amountInSmallestUnit: number, currencyCode: CurrencyCode): string {
  const meta = CURRENCY_META[currencyCode];
  const divisor = Math.pow(10, meta.decimalPlaces);
  const amount = amountInSmallestUnit / divisor;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: meta.decimalPlaces,
      maximumFractionDigits: meta.decimalPlaces,
    }).format(amount);
  } catch {
    // Fallback for environments without full Intl support
    return `${meta.symbol}${amount.toFixed(meta.decimalPlaces)}`;
  }
}

/**
 * Converts a decimal amount to smallest currency unit.
 * e.g. toSmallestUnit(12.34, 'USD') => 1234
 */
export function toSmallestUnit(amount: number, currencyCode: CurrencyCode): number {
  const meta = CURRENCY_META[currencyCode];
  return Math.round(amount * Math.pow(10, meta.decimalPlaces));
}

/**
 * Returns the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCY_META[currencyCode].symbol;
}

/**
 * Returns full currency metadata.
 */
export function getCurrencyMeta(currencyCode: CurrencyCode) {
  return CURRENCY_META[currencyCode];
}