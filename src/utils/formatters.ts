import { getCurrencySymbol } from '../constants/currencies';

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  if (!startDate && !endDate) return '';
  if (!startDate) return formatDate(endDate);
  if (!endDate) return formatDate(startDate);

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
};

export const formatCurrencyAmount = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
};

export const getTripDuration = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};