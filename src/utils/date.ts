/**
 * Format an ISO 8601 date string to a human-readable format.
 */
export function formatDate(isoString: string, locale = 'en-US'): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format an ISO 8601 date string to a short format (e.g. "Jun 24, 2026").
 */
export function formatDateShort(isoString: string, locale = 'en-US'): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format a date range for display.
 */
export function formatDateRange(
  startIso?: string,
  endIso?: string,
  locale = 'en-US',
): string {
  if (!startIso && !endIso) return 'Dates TBD';
  if (startIso && !endIso) return `From ${formatDateShort(startIso, locale)}`;
  if (!startIso && endIso) return `Until ${formatDateShort(endIso, locale)}`;
  return `${formatDateShort(startIso!, locale)} – ${formatDateShort(endIso!, locale)}`;
}

/**
 * Return a relative time string (e.g. "2 days ago").
 */
export function formatRelativeTime(isoString: string, locale = 'en-US'): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) return rtf.format(-diffSeconds, 'second');
    if (Math.abs(diffMinutes) < 60) return rtf.format(-diffMinutes, 'minute');
    if (Math.abs(diffHours) < 24) return rtf.format(-diffHours, 'hour');
    if (Math.abs(diffDays) < 30) return rtf.format(-diffDays, 'day');

    return formatDateShort(isoString, locale);
  } catch {
    return isoString;
  }
}

/**
 * Generate the current ISO 8601 timestamp.
 */
export function nowISO(): string {
  return new Date().toISOString();
}