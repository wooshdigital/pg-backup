import { getCurrencySymbol } from '../constants/currencies';

/**
 * Format a date string (ISO) to a human-readable short date: "Jun 25, 2026"
 */
export const formatShortDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date range for display: "Jun 25 – Jul 4, 2026"
 */
export const formatDateRange = (startIso: string, endIso: string): string => {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
  }

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${endYear}`;
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
};

/**
 * Format a currency amount with symbol: "$42.00"
 */
export const formatCurrencyAmount = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Return the number of days in a date range (inclusive).
 */
export const tripDurationDays = (startIso: string, endIso: string): number => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
};