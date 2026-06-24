/**
 * Formats an ISO 8601 date string to a human-readable short date.
 * e.g. '2024-03-15T10:00:00Z' => 'Mar 15, 2024'
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats an ISO 8601 date string to a relative time string.
 * e.g. '2024-03-15T10:00:00Z' => '3 days ago'
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

/**
 * Returns a date range string for a trip.
 * e.g. 'Mar 15 – Mar 22, 2024'
 */
export function formatDateRange(startIso?: string, endIso?: string): string {
  if (!startIso && !endIso) return 'Dates TBD';
  if (!endIso && startIso) return `From ${formatDate(startIso)}`;
  if (!startIso && endIso) return `Until ${formatDate(endIso)}`;

  const start = new Date(startIso!);
  const end = new Date(endIso!);
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
 * Returns true if the trip is currently active (today falls within date range).
 */
export function isTripActive(startIso?: string, endIso?: string): boolean {
  const now = new Date();
  const start = startIso ? new Date(startIso) : null;
  const end = endIso ? new Date(endIso) : null;

  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}