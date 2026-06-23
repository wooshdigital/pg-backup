/**
 * Format an ISO 8601 date string to a human-readable date.
 */
export function formatDate(isoString: string, locale = 'en-US'): string {
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
 * Format an ISO 8601 date string to a relative time string (e.g. "2 days ago").
 */
export function formatRelativeDate(isoString: string, locale = 'en-US'): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffDays) >= 1) return rtf.format(-diffDays, 'day');
    if (Math.abs(diffHours) >= 1) return rtf.format(-diffHours, 'hour');
    if (Math.abs(diffMinutes) >= 1) return rtf.format(-diffMinutes, 'minute');
    return rtf.format(-diffSeconds, 'second');
  } catch {
    return formatDate(isoString, locale);
  }
}

/**
 * Format a date range from two ISO strings.
 */
export function formatDateRange(
  startIso: string,
  endIso: string,
  locale = 'en-US',
): string {
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const fmt = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    });
    const yearFmt = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (start.getFullYear() === end.getFullYear()) {
      return `${fmt.format(start)} – ${yearFmt.format(end)}`;
    }
    return `${yearFmt.format(start)} – ${yearFmt.format(end)}`;
  } catch {
    return `${startIso} – ${endIso}`;
  }
}

/**
 * Return a new ISO 8601 timestamp string for now.
 */
export function nowISO(): string {
  return new Date().toISOString();
}