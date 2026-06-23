import type { KeyboardEvent } from 'react';

/**
 * Keyboard key constants for consistent usage across components.
 * Uses the KeyboardEvent.key values as defined by the W3C spec.
 */
export const Keys = {
  // Navigation
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',

  // Arrow keys
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',

  // Page navigation
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',

  // Editing
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',

  // Function keys
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
} as const;

export type Key = (typeof Keys)[keyof typeof Keys];

/**
 * Type for a keyboard event handler
 */
export type KeyboardHandler = (event: KeyboardEvent<HTMLElement>) => void;

/**
 * Type for a key-to-handler mapping
 */
export type KeyHandlerMap = Partial<Record<string, KeyboardHandler>>;

/**
 * Creates a keyboard event handler that dispatches to specific key handlers.
 * Only handles the specified keys; all others are ignored.
 *
 * @example
 * const handleKeyDown = createKeyHandler({
 *   [Keys.ENTER]: (e) => handleSelect(e),
 *   [Keys.ESCAPE]: (e) => handleClose(e),
 *   [Keys.ARROW_DOWN]: (e) => handleNext(e),
 * });
 */
export function createKeyHandler(
  keyHandlers: KeyHandlerMap,
  options: {
    /** Whether to prevent default for handled keys */
    preventDefault?: boolean;
    /** Whether to stop propagation for handled keys */
    stopPropagation?: boolean;
  } = {},
): KeyboardHandler {
  const { preventDefault = true, stopPropagation = false } = options;

  return (event: KeyboardEvent<HTMLElement>) => {
    const handler = keyHandlers[event.key];
    if (handler) {
      if (preventDefault) {
        event.preventDefault();
      }
      if (stopPropagation) {
        event.stopPropagation();
      }
      handler(event);
    }
  };
}

/**
 * Checks if a keyboard event is an activation event (Enter or Space).
 * Used for making custom interactive elements keyboard accessible.
 *
 * @example
 * const handleKeyDown = (e) => {
 *   if (isEnterOrSpace(e)) handleActivate();
 * };
 */
export function isEnterOrSpace(event: KeyboardEvent | globalThis.KeyboardEvent): boolean {
  return event.key === Keys.ENTER || event.key === Keys.SPACE;
}

/**
 * Checks if a keyboard event is an arrow key.
 *
 * @example
 * if (isArrowKey(e)) handleNavigation(e.key);
 */
export function isArrowKey(event: KeyboardEvent | globalThis.KeyboardEvent): boolean {
  return (
    event.key === Keys.ARROW_UP ||
    event.key === Keys.ARROW_DOWN ||
    event.key === Keys.ARROW_LEFT ||
    event.key === Keys.ARROW_RIGHT
  );
}

/**
 * Checks if a keyboard event is a navigation key (arrows, home, end, page up/down).
 */
export function isNavigationKey(event: KeyboardEvent | globalThis.KeyboardEvent): boolean {
  return (
    isArrowKey(event) ||
    event.key === Keys.HOME ||
    event.key === Keys.END ||
    event.key === Keys.PAGE_UP ||
    event.key === Keys.PAGE_DOWN
  );
}

/**
 * Gets the next index in a list with optional wrapping.
 *
 * @param currentIndex - The current index
 * @param length - The total number of items
 * @param wrap - Whether to wrap around (default: true)
 *
 * @example
 * getNextIndex(2, 5) // => 3
 * getNextIndex(4, 5) // => 0 (wraps)
 * getNextIndex(4, 5, false) // => 4 (no wrap)
 */
export function getNextIndex(currentIndex: number, length: number, wrap = true): number {
  if (length === 0) return 0;
  const nextIndex = currentIndex + 1;
  if (nextIndex >= length) {
    return wrap ? 0 : length - 1;
  }
  return nextIndex;
}

/**
 * Gets the previous index in a list with optional wrapping.
 *
 * @param currentIndex - The current index
 * @param length - The total number of items
 * @param wrap - Whether to wrap around (default: true)
 *
 * @example
 * getPrevIndex(2, 5) // => 1
 * getPrevIndex(0, 5) // => 4 (wraps)
 * getPrevIndex(0, 5, false) // => 0 (no wrap)
 */
export function getPrevIndex(currentIndex: number, length: number, wrap = true): number {
  if (length === 0) return 0;
  const prevIndex = currentIndex - 1;
  if (prevIndex < 0) {
    return wrap ? length - 1 : 0;
  }
  return prevIndex;
}

/**
 * Creates an onKeyDown handler for roving tabindex patterns.
 * Used in composite widgets like listboxes, grids, and toolbars.
 */
export function createRovingTabindexHandler(options: {
  items: HTMLElement[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
}): KeyboardHandler {
  const {
    items,
    currentIndex,
    onIndexChange,
    orientation = 'vertical',
    wrap = true,
  } = options;

  return (event: KeyboardEvent<HTMLElement>) => {
    let nextIndex: number | undefined;

    const handleNext = () => {
      nextIndex = getNextIndex(currentIndex, items.length, wrap);
    };

    const handlePrev = () => {
      nextIndex = getPrevIndex(currentIndex, items.length, wrap);
    };

    switch (event.key) {
      case Keys.ARROW_DOWN:
        if (orientation === 'vertical' || orientation === 'both') {
          handleNext();
        }
        break;
      case Keys.ARROW_UP:
        if (orientation === 'vertical' || orientation === 'both') {
          handlePrev();
        }
        break;
      case Keys.ARROW_RIGHT:
        if (orientation === 'horizontal' || orientation === 'both') {
          handleNext();
        }
        break;
      case Keys.ARROW_LEFT:
        if (orientation === 'horizontal' || orientation === 'both') {
          handlePrev();
        }
        break;
      case Keys.HOME:
        nextIndex = 0;
        break;
      case Keys.END:
        nextIndex = items.length - 1;
        break;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      onIndexChange(nextIndex);
      items[nextIndex]?.focus();
    }
  };
}