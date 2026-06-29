export const AVATAR_COLOR_PALETTE: string[] = [
  '#F94144',
  '#F3722C',
  '#F8961E',
  '#F9C74F',
  '#90BE6D',
  '#43AA8B',
  '#4D908E',
  '#577590',
  '#277DA1',
  '#9B5DE5',
  '#F15BB5',
  '#00BBF9',
];

export function getRandomAvatarColor(): string {
  const index = Math.floor(Math.random() * AVATAR_COLOR_PALETTE.length);
  return AVATAR_COLOR_PALETTE[index];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}