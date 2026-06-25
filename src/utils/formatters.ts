import { getCurrencySymbol } from '../constants/currencies';

/**
 * Format an ISO date string to a human-readable short date.
 * e.g. "2026-06-25" => "Jun 25, 2026"
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date range to a human-readable string.
 * e.g. "Jun 25 – Jul 4, 2026"
 */
export function formatDateRange(startIso: string, endIso: string): string {
  if (!startIso || !endIso) return '';
  const start = new Date(startIso);
  const end = new Date(endIso);

  const sameYear = start.getFullYear() === end.getFullYear();

  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${startStr} – ${endStr}`;
}

/**
 * Format a currency amount with the correct symbol.
 * e.g. formatCurrency(42.5, 'USD') => "$42.50"
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Return number of days between two ISO date strings (inclusive).
 */
export function tripDurationDays(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}