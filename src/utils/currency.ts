import type { CurrencyCode } from '../types';

// ─── Currency Registry ────────────────────────────────────────────────────────

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; decimals: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', decimals: 2 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2 },
  THB: { symbol: '฿', name: 'Thai Baht', decimals: 2 },
};

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options: { showSymbol?: boolean; showCode?: boolean } = {},
): string {
  const { showSymbol = true, showCode = false } = options;
  const { symbol, decimals } = CURRENCIES[currency];

  const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const parts: string[] = [];
  if (showSymbol) parts.push(symbol);
  parts.push(formatted);
  if (showCode) parts.push(currency);

  return parts.join(showSymbol ? '' : ' ');
}

export function parseCurrencyInput(input: string): number {
  // Remove any non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function roundToCurrency(amount: number, currency: CurrencyCode): number {
  const { decimals } = CURRENCIES[currency];
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}