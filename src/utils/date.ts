// ─── Date Utilities ───────────────────────────────────────────────────────────

/**
 * Format an ISO 8601 date string to a human-readable date
 */
export function formatDate(isoString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format an ISO 8601 date string to a relative time string (e.g. "2 days ago")
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

/**
 * Format a date range for display
 */
export function formatDateRange(startIso?: string, endIso?: string): string {
  if (!startIso && !endIso) return 'Dates TBD';
  if (startIso && !endIso) return `From ${formatDate(startIso)}`;
  if (!startIso && endIso) return `Until ${formatDate(endIso)}`;

  const start = new Date(startIso!);
  const end = new Date(endIso!);

  // Same month and year
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${formatDate(startIso!)} – ${formatDate(endIso!)}`;
}

/**
 * Returns an ISO 8601 string for now
 */
export function nowISO(): string {
  return new Date().toISOString();
}