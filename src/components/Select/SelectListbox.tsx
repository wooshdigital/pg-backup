import React, { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSelectContext } from './SelectContext';
import { SelectOption } from './SelectOption';
import { useSelectKeyboard } from './useSelectKeyboard';
import styles from './Select.module.css';

interface SelectListboxProps {
  activeIndex: number;
  onSetActiveIndex: (index: number) => void;
  maxHeight: number;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export function SelectListbox({
  activeIndex,
  onSetActiveIndex,
  maxHeight,
  triggerRef,
}: SelectListboxProps) {
  const {
    options,
    isOpen,
    selectedValues,
    multiple,
    listboxId,
    onClose,
    onSelect,
    onOpen,
    activeDescendant,
  } = useSelectContext();

  const listRef = useRef<HTMLDivElement>(null);

  const { handleListboxKeyDown } = useSelectKeyboard({
    options,
    isOpen,
    activeIndex,
    onOpen,
    onClose,
    onSetActiveIndex,
    onSelect,
    multiple,
  });

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 36,
    overscan: 5,
  });

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0) {
      virtualizer.scrollToIndex(activeIndex, { align: 'auto' });
    }
  }, [activeIndex, virtualizer]);

  // Focus the listbox when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={activeDescendant}
      tabIndex={-1}
      className={styles.listbox}
      style={{ maxHeight }}
      onKeyDown={handleListboxKeyDown}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const option = options[virtualItem.index];
          const optionId = `${listboxId}-option-${virtualItem.index}`;
          const isSelected = selectedValues.includes(option.value);
          const isActive = virtualItem.index === activeIndex;

          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <SelectOption
                id={optionId}
                option={option}
                isSelected={isSelected}
                isActive={isActive}
                index={virtualItem.index}
                onSetActiveIndex={onSetActiveIndex}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}