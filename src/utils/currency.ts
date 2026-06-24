import { CurrencyCode, Currency } from '../types';

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', decimalPlaces: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', decimalPlaces: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2 },
};

/**
 * Format a minor-unit amount (e.g. cents) to a display string.
 * @param minorAmount - Amount in minor units (e.g. 1050 = $10.50)
 * @param currencyCode - ISO 4217 currency code
 * @param locale - BCP 47 locale string (default: 'en-US')
 */
export function formatCurrency(
  minorAmount: number,
  currencyCode: CurrencyCode,
  locale = 'en-US',
): string {
  const currency = CURRENCIES[currencyCode];
  const divisor = Math.pow(10, currency.decimalPlaces);
  const majorAmount = minorAmount / divisor;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(majorAmount);
  } catch {
    // Fallback for environments without Intl support
    return `${currency.symbol}${majorAmount.toFixed(currency.decimalPlaces)}`;
  }
}

/**
 * Convert a display amount (e.g. 10.50) to minor units (e.g. 1050).
 */
export function toMinorUnits(majorAmount: number, currencyCode: CurrencyCode): number {
  const currency = CURRENCIES[currencyCode];
  const multiplier = Math.pow(10, currency.decimalPlaces);
  return Math.round(majorAmount * multiplier);
}

/**
 * Convert minor units back to major units.
 */
export function toMajorUnits(minorAmount: number, currencyCode: CurrencyCode): number {
  const currency = CURRENCIES[currencyCode];
  const divisor = Math.pow(10, currency.decimalPlaces);
  return minorAmount / divisor;
}