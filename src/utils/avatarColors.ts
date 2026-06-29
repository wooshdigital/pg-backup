export const AVATAR_COLOR_PALETTE: string[] = [
  '#F87171', // red-400
  '#FB923C', // orange-400
  '#FBBF24', // amber-400
  '#A3E635', // lime-400
  '#34D399', // emerald-400
  '#22D3EE', // cyan-400
  '#60A5FA', // blue-400
  '#818CF8', // indigo-400
  '#C084FC', // purple-400
  '#F472B6', // pink-400
  '#2DD4BF', // teal-400
  '#E879F9', // fuchsia-400
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