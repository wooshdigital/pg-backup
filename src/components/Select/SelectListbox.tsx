import React, { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSelectContext } from './SelectContext';
import { SelectOption as SelectOptionComponent } from './SelectOption';
import type { SelectOption } from './SelectContext';
import styles from './Select.module.css';

export interface SelectListboxProps {
  options: SelectOption[];
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSetActiveIndex: (index: number) => void;
}

const ITEM_HEIGHT = 36;
const MAX_VISIBLE_ITEMS = 8;

export function SelectListbox({
  options,
  activeIndex,
  onKeyDown,
  onSetActiveIndex,
}: SelectListboxProps) {
  const { listboxId, getOptionId, isSelected } = useSelectContext();
  const listboxRef = useRef<HTMLDivElement>(null);

  const useVirtual = options.length > 50;

  const rowVirtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => (useVirtual ? listboxRef.current : null),
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
    enabled: useVirtual,
  });

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0) return;
    if (useVirtual) {
      rowVirtualizer.scrollToIndex(activeIndex, { align: 'auto' });
    } else {
      const el = document.getElementById(getOptionId(options[activeIndex]?.value ?? ''));
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, useVirtual, rowVirtualizer, getOptionId, options]);

  // Focus listbox on open
  useEffect(() => {
    listboxRef.current?.focus();
  }, []);

  const maxHeight = Math.min(options.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT;

  if (useVirtual) {
    return (
      <div
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        tabIndex={-1}
        className={styles.listbox}
        style={{ maxHeight, overflowY: 'auto' }}
        onKeyDown={onKeyDown}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const option = options[virtualItem.index];
            return (
              <div
                key={option.value}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: ITEM_HEIGHT,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <SelectOptionComponent
                  option={option}
                  index={virtualItem.index}
                  isActive={virtualItem.index === activeIndex}
                  isSelected={isSelected(option.value)}
                  onSetActiveIndex={onSetActiveIndex}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      tabIndex={-1}
      className={styles.listbox}
      style={{ maxHeight, overflowY: 'auto' }}
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => (
        <SelectOptionComponent
          key={option.value}
          option={option}
          index={index}
          isActive={index === activeIndex}
          isSelected={isSelected(option.value)}
          onSetActiveIndex={onSetActiveIndex}
        />
      ))}
    </div>
  );
}

export default SelectListbox;