import { useState, useEffect, useCallback, useRef } from 'react';
import type { FocusEvent } from 'react';
import type { FocusVisibleState } from '../types';

/**
 * Tracks whether the last user interaction was via keyboard or pointer.
 * This is used to show/hide focus rings appropriately.
 *
 * When users navigate with a keyboard, focus rings should be visible.
 * When users click with a mouse/touch, focus rings can be hidden.
 *
 * This mirrors the CSS `:focus-visible` pseudo-class behavior in JavaScript,
 * providing a hook-based API for custom focus styling.
 */

/** Module-level state to track interaction mode across all instances */
let isKeyboardUser = false;

/** Set of active listeners (allows multiple hook instances to share state) */
const listeners = new Set<(isKeyboard: boolean) => void>();

function notifyListeners(isKeyboard: boolean): void {
  isKeyboardUser = isKeyboard;
  listeners.forEach((listener) => listener(isKeyboard));
}

// Register global event listeners once
let globalListenersRegistered = false;

function registerGlobalListeners(): void {
  if (globalListenersRegistered || typeof window === 'undefined') return;
  globalListenersRegistered = true;

  const handleKeyDown = (e: globalThis.KeyboardEvent) => {
    // Tab key always triggers keyboard mode
    // Other keys also trigger keyboard mode when they cause focus changes
    if (e.key === 'Tab' || e.key === 'F6') {
      notifyListeners(true);
    }
  };

  const handlePointerDown = () => {
    notifyListeners(false);
  };

  const handleMouseDown = () => {
    notifyListeners(false);
  };

  const handleTouchStart = () => {
    notifyListeners(false);
  };

  // Use capture phase to detect events before they reach components
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  window.addEventListener('pointerdown', handlePointerDown, { capture: true });
  window.addEventListener('mousedown', handleMouseDown, { capture: true });
  window.addEventListener('touchstart', handleTouchStart, { capture: true });
}

/**
 * Hook that detects whether focus is visible (keyboard-driven) or not (pointer-driven).
 *
 * Returns props to spread onto the element and a boolean indicating focus visibility.
 *
 * @example
 * function Button({ children }) {
 *   const { isFocusVisible, focusProps } = useFocusVisible();
 *
 *   return (
 *     <button
 *       {...focusProps}
 *       className={cx('btn', { 'btn--focus-visible': isFocusVisible })}
 *     >
 *       {children}
 *     </button>
 *   );
 * }
 */
export function useFocusVisible(): FocusVisibleState {
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboard, setIsKeyboard] = useState(isKeyboardUser);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Register global listeners on first use
    registerGlobalListeners();

    // Subscribe to keyboard/pointer mode changes
    const listener = (keyboard: boolean) => {
      if (isMountedRef.current) {
        setIsKeyboard(keyboard);
      }
    };

    listeners.add(listener);

    return () => {
      isMountedRef.current = false;
      listeners.delete(listener);
    };
  }, []);

  const handleFocus = useCallback((_e: FocusEvent) => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback((_e: FocusEvent) => {
    setIsFocused(false);
  }, []);

  return {
    isFocusVisible: isFocused && isKeyboard,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}

/**
 * Hook that provides the current keyboard navigation mode without focus tracking.
 * Useful for components that need to change behavior based on input modality.
 *
 * @example
 * function CustomList() {
 *   const isKeyboardMode = useIsKeyboardUser();
 *   // Show more prominent focus indicators in keyboard mode
 * }
 */
export function useIsKeyboardUser(): boolean {
  const [isKeyboard, setIsKeyboard] = useState(isKeyboardUser);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    registerGlobalListeners();

    const listener = (keyboard: boolean) => {
      if (isMountedRef.current) {
        setIsKeyboard(keyboard);
      }
    };

    listeners.add(listener);

    return () => {
      isMountedRef.current = false;
      listeners.delete(listener);
    };
  }, []);

  return isKeyboard;
}