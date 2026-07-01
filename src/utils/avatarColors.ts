const AVATAR_COLORS = [
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#DC2626', // Red
  '#D97706', // Amber
  '#059669', // Emerald
  '#0284C7', // Sky
  '#9333EA', // Purple
  '#EA580C', // Orange
  '#0891B2', // Cyan
];

/**
 * Get a consistent avatar color for a given ID
 */
export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}