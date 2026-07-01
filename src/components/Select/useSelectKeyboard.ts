import { useCallback, useRef } from 'react';
import type { SelectOption } from './SelectContext';

export interface UseSelectKeyboardOptions {
  options: SelectOption[];
  isOpen: boolean;
  activeIndex: number;
  onOpen: () => void;
  onClose: () => void;
  onSetActiveIndex: (index: number) => void;
  onSelect: (value: string) => void;
  multiple: boolean;
}

export function useSelectKeyboard({
  options,
  isOpen,
  activeIndex,
  onOpen,
  onClose,
  onSetActiveIndex,
  onSelect,
  multiple,
}: UseSelectKeyboardOptions) {
  const typeaheadBuffer = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enabledOptions = options.filter((o) => !o.disabled);

  const getEnabledIndex = useCallback(
    (value: string) => enabledOptions.findIndex((o) => o.value === value),
    [enabledOptions]
  );

  const getNextEnabledIndex = useCallback(
    (from: number, direction: 1 | -1): number => {
      const total = options.length;
      let i = from + direction;
      while (i >= 0 && i < total) {
        if (!options[i].disabled) return i;
        i += direction;
      }
      return from;
    },
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

  const handleTypeahead = useCallback(
    (char: string) => {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadBuffer.current += char.toLowerCase();

      const buffer = typeaheadBuffer.current;
      const startIndex = isOpen ? activeIndex + 1 : 0;

      // Search from current position forward, then wrap
      const indices = [
        ...Array.from({ length: options.length - startIndex }, (_, i) => i + startIndex),
        ...Array.from({ length: startIndex }, (_, i) => i),
      ];

      const match = indices.find((i) => {
        const opt = options[i];
        return !opt.disabled && opt.label.toLowerCase().startsWith(buffer);
      });

      if (match !== undefined) {
        onSetActiveIndex(match);
        if (!isOpen) {
          onSelect(options[match].value);
        }
      }

      typeaheadTimer.current = setTimeout(() => {
        typeaheadBuffer.current = '';
      }, 500);
    },
    [options, isOpen, activeIndex, onSetActiveIndex, onSelect]
  );

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
          } else {
            if (activeIndex >= 0 && activeIndex < options.length) {
              onSelect(options[activeIndex].value);
              if (!multiple) onClose();
            }
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
            const first = getFirstEnabledIndex();
            if (first >= 0) onSetActiveIndex(first);
          } else {
            const next = getNextEnabledIndex(activeIndex, 1);
            onSetActiveIndex(next);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
            const last = getLastEnabledIndex();
            if (last >= 0) onSetActiveIndex(last);
          } else {
            const prev = getNextEnabledIndex(activeIndex, -1);
            onSetActiveIndex(prev);
          }
          break;

        case 'Home':
          e.preventDefault();
          if (isOpen) {
            onSetActiveIndex(getFirstEnabledIndex());
          }
          break;

        case 'End':
          e.preventDefault();
          if (isOpen) {
            onSetActiveIndex(getLastEnabledIndex());
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        case 'Tab':
          if (isOpen) {
            onClose();
          }
          break;

        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            handleTypeahead(e.key);
          }
          break;
      }
    },
    [
      isOpen,
      activeIndex,
      options,
      multiple,
      onOpen,
      onClose,
      onSelect,
      onSetActiveIndex,
      getFirstEnabledIndex,
      getLastEnabledIndex,
      getNextEnabledIndex,
      handleTypeahead,
    ]
  );

  const handleListboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleTriggerKeyDown(e);
    },
    [handleTriggerKeyDown]
  );

  return { handleTriggerKeyDown, handleListboxKeyDown };
}