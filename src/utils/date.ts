/**
 * Shared date utilities.
 * Uses only native JS APIs to avoid adding a heavy date library.
 */

/** Return an ISO 8601 string for the current moment. */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Format a date for display.
 * e.g. formatDate('2024-03-15T12:00:00Z') → 'Mar 15, 2024'
 */
export function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/**
 * Format a date range for display.
 * e.g. formatDateRange('2024-03-10', '2024-03-15') → 'Mar 10 – 15, 2024'
 */
export function formatDateRange(startISO: string, endISO: string): string {
  try {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const fmt = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  } catch {
    return `${startISO} – ${endISO}`;
  }
}

/**
 * Return a relative time label.
 * e.g. 'just now', '5 minutes ago', '3 days ago'
 */
export function relativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return formatDate(isoString);
  } catch {
    return isoString;
  }
}

/** Check if an ISO date string is in the past. */
export function isPast(isoString: string): boolean {
  return new Date(isoString).getTime() < Date.now();
}