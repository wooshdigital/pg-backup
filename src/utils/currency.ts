import type { CurrencyCode, Money } from '../types';

// ─── Currency Map ─────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  MXN: 'MX$',
  BRL: 'R$',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  NZD: 'NZ$',
  ZAR: 'R',
  THB: '฿',
};

const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'CLP', 'PYG']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

export function isZeroDecimal(code: CurrencyCode): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(code);
}

/**
 * Convert smallest unit (cents) to display amount
 */
export function toDisplayAmount(amountInCents: number, currency: CurrencyCode): number {
  if (isZeroDecimal(currency)) return amountInCents;
  return amountInCents / 100;
}

/**
 * Convert display amount to smallest unit (cents)
 */
export function toCents(amount: number, currency: CurrencyCode): number {
  if (isZeroDecimal(currency)) return Math.round(amount);
  return Math.round(amount * 100);
}

/**
 * Format a Money object to a human-readable string
 */
export function formatMoney(money: Money, options?: { showCode?: boolean }): string {
  const displayAmount = toDisplayAmount(money.amount, money.currency);
  const symbol = getCurrencySymbol(money.currency);
  const decimals = isZeroDecimal(money.currency) ? 0 : 2;

  const formatted = displayAmount.toFixed(decimals);
  const result = `${symbol}${formatted}`;

  return options?.showCode ? `${result} ${money.currency}` : result;
}

/**
 * Format a raw number as currency
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const symbol = getCurrencySymbol(currency);
  const decimals = isZeroDecimal(currency) ? 0 : 2;
  return `${symbol}${amount.toFixed(decimals)}`;
}