/**
 * Key codes for keyboard navigation (web / physical keyboard on native).
 */
export const Keys = {
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
} as const;

export type Key = (typeof Keys)[keyof typeof Keys];

/**
 * Returns true if the key event corresponds to an activation key (Enter or Space).
 */
export function isActivationKey(key: string): boolean {
  return key === Keys.Enter || key === Keys.Space;
}