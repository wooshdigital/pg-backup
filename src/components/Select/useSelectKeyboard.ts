import { useCallback, useRef } from 'react';
import type { SelectOption } from './SelectContext';

export interface UseSelectKeyboardOptions {
  options: SelectOption[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelect: (value: string) => void;
  onClose: () => void;
  onOpen: () => void;
  isOpen: boolean;
}

export function useSelectKeyboard({
  options,
  activeIndex,
  setActiveIndex,
  onSelect,
  onClose,
  onOpen,
  isOpen,
}: UseSelectKeyboardOptions) {
  const typeaheadRef = useRef('');
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getEnabledOptions = useCallback(
    () => options.filter((o) => !o.disabled),
    [options]
  );

  const getFirstEnabledIndex = useCallback(() => {
    return options.findIndex((o) => !o.disabled);
  }, [options]);

  const getLastEnabledIndex = useCallback(() => {
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) return i;
    }
    return -1;
  }, [options]);

  const getNextEnabledIndex = useCallback(
    (from: number) => {
      for (let i = from + 1; i < options.length; i++) {
        if (!options[i].disabled) return i;
      }
      return from;
    },
    [options]
  );

  const getPrevEnabledIndex = useCallback(
    (from: number) => {
      for (let i = from - 1; i >= 0; i--) {
        if (!options[i].disabled) return i;
      }
      return from;
    },
    [options]
  );

  const handleTypeahead = useCallback(
    (char: string) => {
      // Clear previous timer
      if (typeaheadTimerRef.current) {
        clearTimeout(typeaheadTimerRef.current);
      }

      typeaheadRef.current += char.toLowerCase();

      typeaheadTimerRef.current = setTimeout(() => {
        typeaheadRef.current = '';
      }, 500);

      const search = typeaheadRef.current;
      // Search from current position + 1, then wrap
      const startIndex = activeIndex >= 0 ? activeIndex + 1 : 0;

      let found = -1;
      // Search from current position to end
      for (let i = startIndex; i < options.length; i++) {
        if (
          !options[i].disabled &&
          options[i].label.toLowerCase().startsWith(search)
        ) {
          found = i;
          break;
        }
      }
      // Wrap around from beginning
      if (found === -1) {
        for (let i = 0; i < startIndex; i++) {
          if (
            !options[i].disabled &&
            options[i].label.toLowerCase().startsWith(search)
          ) {
            found = i;
            break;
          }
        }
      }

      if (found !== -1) {
        setActiveIndex(found);
      }
    },
    [options, activeIndex, setActiveIndex]
  );

  /**
   * Handle keydown on the trigger button (when listbox is closed or open)
   */
  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!isOpen) {
            onOpen();
          } else {
            if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
              onSelect(options[activeIndex].value);
            }
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            onOpen();
          } else {
            setActiveIndex(getNextEnabledIndex(activeIndex));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            onOpen();
          } else {
            setActiveIndex(getPrevEnabledIndex(activeIndex));
          }
          break;
        case 'Home':
          if (isOpen) {
            event.preventDefault();
            setActiveIndex(getFirstEnabledIndex());
          }
          break;
        case 'End':
          if (isOpen) {
            event.preventDefault();
            setActiveIndex(getLastEnabledIndex());
          }
          break;
        case 'Escape':
          if (isOpen) {
            event.preventDefault();
            onClose();
          }
          break;
        case 'Tab':
          if (isOpen) {
            onClose();
          }
          break;
        default:
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            if (!isOpen) {
              onOpen();
            }
            handleTypeahead(event.key);
          }
          break;
      }
    },
    [
      isOpen,
      onOpen,
      onClose,
      onSelect,
      activeIndex,
      options,
      setActiveIndex,
      getFirstEnabledIndex,
      getLastEnabledIndex,
      getNextEnabledIndex,
      getPrevEnabledIndex,
      handleTypeahead,
    ]
  );

  /**
   * Handle keydown inside the listbox
   */
  const handleListboxKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
            onSelect(options[activeIndex].value);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex(getNextEnabledIndex(activeIndex));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex(getPrevEnabledIndex(activeIndex));
          break;
        case 'Home':
          event.preventDefault();
          setActiveIndex(getFirstEnabledIndex());
          break;
        case 'End':
          event.preventDefault();
          setActiveIndex(getLastEnabledIndex());
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'Tab':
          onClose();
          break;
        default:
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            handleTypeahead(event.key);
          }
          break;
      }
    },
    [
      activeIndex,
      options,
      onSelect,
      onClose,
      setActiveIndex,
      getFirstEnabledIndex,
      getLastEnabledIndex,
      getNextEnabledIndex,
      getPrevEnabledIndex,
      handleTypeahead,
    ]
  );

  return {
    handleTriggerKeyDown,
    handleListboxKeyDown,
  };
}