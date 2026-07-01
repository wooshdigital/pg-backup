import { useCallback, useRef } from 'react';
import type { SelectOption } from './SelectContext';

export interface UseSelectKeyboardOptions {
  options: SelectOption[];
  activeIndex: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onSetActiveIndex: (index: number) => void;
}

export function useSelectKeyboard({
  options,
  activeIndex,
  isOpen,
  onOpen,
  onClose,
  onSelectIndex,
  onSetActiveIndex,
}: UseSelectKeyboardOptions) {
  const typeaheadBuffer = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getEnabledOptions = useCallback(() => {
    return options.map((opt, index) => ({ opt, index })).filter(({ opt }) => !opt.disabled);
  }, [options]);

  const findNextEnabled = useCallback(
    (from: number, direction: 1 | -1): number => {
      let idx = from + direction;
      while (idx >= 0 && idx < options.length) {
        if (!options[idx].disabled) return idx;
        idx += direction;
      }
      return from;
    },
    [options]
  );

  const findFirstEnabled = useCallback((): number => {
    for (let i = 0; i < options.length; i++) {
      if (!options[i].disabled) return i;
    }
    return 0;
  }, [options]);

  const findLastEnabled = useCallback((): number => {
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) return i;
    }
    return options.length - 1;
  }, [options]);

  const handleTypeahead = useCallback(
    (char: string) => {
      typeaheadBuffer.current += char.toLowerCase();

      if (typeaheadTimer.current) {
        clearTimeout(typeaheadTimer.current);
      }
      typeaheadTimer.current = setTimeout(() => {
        typeaheadBuffer.current = '';
      }, 500);

      const buffer = typeaheadBuffer.current;
      const enabledOptions = getEnabledOptions();

      // Try to find an option starting after the current activeIndex
      const searchFrom = activeIndex;
      const afterCurrent = enabledOptions.filter(({ index }) => index > searchFrom);
      const beforeAndCurrent = enabledOptions.filter(({ index }) => index <= searchFrom);
      const searchOrder = [...afterCurrent, ...beforeAndCurrent];

      const match = searchOrder.find(({ opt }) =>
        opt.label.toLowerCase().startsWith(buffer)
      );

      if (match !== undefined) {
        onSetActiveIndex(match.index);
        if (!isOpen) {
          onOpen();
        }
      }
    },
    [activeIndex, getEnabledOptions, isOpen, onOpen, onSetActiveIndex]
  );

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
          } else {
            const next = findNextEnabled(activeIndex, 1);
            onSetActiveIndex(next);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
          } else {
            const prev = findNextEnabled(activeIndex, -1);
            onSetActiveIndex(prev);
          }
          break;
        case 'Home':
          e.preventDefault();
          onSetActiveIndex(findFirstEnabled());
          if (!isOpen) onOpen();
          break;
        case 'End':
          e.preventDefault();
          onSetActiveIndex(findLastEnabled());
          if (!isOpen) onOpen();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            handleTypeahead(e.key);
          }
      }
    },
    [
      isOpen,
      activeIndex,
      onOpen,
      onClose,
      findNextEnabled,
      findFirstEnabled,
      findLastEnabled,
      onSetActiveIndex,
      handleTypeahead,
    ]
  );

  const handleListboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          onSetActiveIndex(findNextEnabled(activeIndex, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          onSetActiveIndex(findNextEnabled(activeIndex, -1));
          break;
        case 'Home':
          e.preventDefault();
          onSetActiveIndex(findFirstEnabled());
          break;
        case 'End':
          e.preventDefault();
          onSetActiveIndex(findLastEnabled());
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < options.length) {
            onSelectIndex(activeIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          onClose();
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            handleTypeahead(e.key);
          }
      }
    },
    [
      activeIndex,
      options,
      findNextEnabled,
      findFirstEnabled,
      findLastEnabled,
      onSelectIndex,
      onSetActiveIndex,
      onClose,
      handleTypeahead,
    ]
  );

  return { handleTriggerKeyDown, handleListboxKeyDown };
}