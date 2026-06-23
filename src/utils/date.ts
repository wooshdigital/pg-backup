/**
 * Format an ISO date string (YYYY-MM-DD) to a human-readable format.
 */
export function formatDate(isoDateString: string, locale = 'en-US'): string {
  try {
    const date = new Date(isoDateString + 'T00:00:00');
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDateString;
  }
}

/**
 * Format an ISO timestamp to a relative time string (e.g. "2 hours ago").
 */
export function formatRelativeTime(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(isoTimestamp.split('T')[0]);
  } catch {
    return isoTimestamp;
  }
}

/**
 * Get the current date as an ISO date string (YYYY-MM-DD).
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the current timestamp as an ISO 8601 string.
 */
export function getNowISO(): string {
  return new Date().toISOString();
}