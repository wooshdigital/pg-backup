import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { SelectOption } from './SelectContext';
import { SelectOption as SelectOptionComponent } from './SelectOption';
import styles from './Select.module.css';

export interface SelectListboxProps {
  options: SelectOption[];
  selectedValues: string[];
  activeIndex: number;
  listboxId: string;
  optionIdPrefix: string;
  multiple: boolean;
  onSelectOption: (value: string) => void;
  onActiveIndexChange: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  labelledBy?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export interface SelectListboxHandle {
  focus: () => void;
}

/** Threshold above which we enable virtual scrolling */
const VIRTUAL_THRESHOLD = 50;
/** Estimated height of each option row in px */
const OPTION_HEIGHT = 36;

export const SelectListbox = forwardRef<
  SelectListboxHandle,
  SelectListboxProps
>(
  (
    {
      options,
      selectedValues,
      activeIndex,
      listboxId,
      optionIdPrefix,
      multiple,
      onSelectOption,
      onActiveIndexChange,
      onKeyDown,
      labelledBy,
      searchable,
      searchValue,
      onSearchChange,
    },
    ref
  ) => {
    const listRef = useRef<HTMLUListElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus() {
        if (searchable && searchRef.current) {
          searchRef.current.focus();
        } else {
          listRef.current?.focus();
        }
      },
    }));

    const useVirtual = options.length >= VIRTUAL_THRESHOLD;

    const rowVirtualizer = useVirtualizer({
      count: options.length,
      getScrollElement: () => (useVirtual ? scrollContainerRef.current : null),
      estimateSize: () => OPTION_HEIGHT,
      overscan: 5,
      enabled: useVirtual,
    });

    // Scroll active item into view
    useEffect(() => {
      if (activeIndex < 0) return;

      if (useVirtual) {
        rowVirtualizer.scrollToIndex(activeIndex, { align: 'auto' });
      } else {
        const activeId = `${optionIdPrefix}-${activeIndex}`;
        const el = document.getElementById(activeId);
        if (el) {
          el.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [activeIndex, useVirtual, optionIdPrefix, rowVirtualizer]);

    const activeDescendant =
      activeIndex >= 0 ? `${optionIdPrefix}-${activeIndex}` : undefined;

    const renderOption = (option: SelectOption, index: number) => {
      const isSelected = selectedValues.includes(option.value);
      const isActive = index === activeIndex;
      const optionId = `${optionIdPrefix}-${index}`;

      return (
        <SelectOptionComponent
          key={option.value}
          optionId={optionId}
          value={option.value}
          label={option.label}
          disabled={option.disabled}
          isActive={isActive}
          isSelected={isSelected}
          onClick={() => onSelectOption(option.value)}
          onMouseEnter={() => onActiveIndexChange(index)}
        />
      );
    };

    return (
      <div className={styles.listboxWrapper} id={listboxId} role="presentation">
        {searchable && (
          <div className={styles.searchWrapper}>
            <input
              ref={searchRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search…"
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Search options"
              aria-autocomplete="list"
              aria-controls={`${listboxId}-list`}
            />
          </div>
        )}

        {options.length === 0 ? (
          <div className={styles.emptyState} role="status">
            No options found
          </div>
        ) : useVirtual ? (
          <div
            ref={scrollContainerRef}
            style={{ overflow: 'auto', maxHeight: 268 }}
          >
            <ul
              ref={listRef}
              id={`${listboxId}-list`}
              role="listbox"
              aria-multiselectable={multiple ? true : undefined}
              aria-labelledby={labelledBy}
              aria-activedescendant={activeDescendant}
              tabIndex={searchable ? -1 : 0}
              className={styles.listbox}
              onKeyDown={onKeyDown}
              style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const option = options[virtualItem.index];
                const isSelected = selectedValues.includes(option.value);
                const isActive = virtualItem.index === activeIndex;
                const optionId = `${optionIdPrefix}-${virtualItem.index}`;

                return (
                  <li
                    key={option.value}
                    id={optionId}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled ? true : undefined}
                    className={[
                      styles.option,
                      isActive ? styles.optionActive : '',
                      isSelected ? styles.optionSelected : '',
                      option.disabled ? styles.optionDisabled : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!option.disabled) onSelectOption(option.value);
                    }}
                    onMouseEnter={() => {
                      if (!option.disabled)
                        onActiveIndexChange(virtualItem.index);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span
                      className={[
                        styles.optionCheck,
                        isSelected ? '' : styles.optionCheckHidden,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span>{option.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <ul
            ref={listRef}
            id={`${listboxId}-list`}
            role="listbox"
            aria-multiselectable={multiple ? true : undefined}
            aria-labelledby={labelledBy}
            aria-activedescendant={activeDescendant}
            tabIndex={searchable ? -1 : 0}
            className={styles.listbox}
            onKeyDown={onKeyDown}
          >
            {options.map((option, index) => renderOption(option, index))}
          </ul>
        )}
      </div>
    );
  }
);

SelectListbox.displayName = 'SelectListbox';

export default SelectListbox;