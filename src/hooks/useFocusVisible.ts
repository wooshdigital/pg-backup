import { useCallback, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

interface FocusVisibleResult {
  isFocusVisible: boolean;
  focusProps: {
    onFocus: () => void;
    onBlur: () => void;
    onPressIn: (e: GestureResponderEvent) => void;
  };
}

/**
 * Tracks whether an element has keyboard-style focus (vs pointer focus).
 * Useful for accessibility — shows focus ring only on keyboard navigation.
 */
export function useFocusVisible(): FocusVisibleResult {
  const [isFocused, setIsFocused] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
    setIsPointer(false);
  }, []);

  const onPressIn = useCallback(() => {
    setIsPointer(true);
  }, []);

  return {
    isFocusVisible: isFocused && !isPointer,
    focusProps: { onFocus, onBlur, onPressIn },
  };
}