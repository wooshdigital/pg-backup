import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  forwardRef,
} from 'react';
import { SelectContext } from './SelectContext';
import type { SelectOption } from './SelectContext';
import { SelectListbox } from './SelectListbox';
import type { SelectListboxHandle } from './SelectListbox';
import { useSelectKeyboard } from './useSelectKeyboard';
import styles from './Select.module.css';

export interface SelectProps {
  /** Flat list of options */
  options: SelectOption[];
  /** Controlled selected value (single) */
  value?: string | string[];
  /** Default value for uncontrolled mode */
  defaultValue?: string | string[];
  /** Called when selection changes */
  onChange?: (value: string | string[]) => void;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Whether in error/invalid state */
  error?: boolean;
  /** ID for the trigger button */
  id?: string;
  /** aria-label for the trigger */
  'aria-label'?: string;
  /** aria-labelledby for the trigger */
  'aria-labelledby'?: string;
  /** aria-describedby for the trigger */
  'aria-describedby'?: string;
  /** Enable typeahead search filter */
  searchable?: boolean;
  /** Custom class for the container */
  className?: string;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    className={[styles.chevron, open ? styles.open : ''].filter(Boolean).join(' ')}
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      multiple = false,
      placeholder = 'Select…',
      disabled = false,
      error = false,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      searchable = false,
      className,
    },
    ref
  ) => {
    const uid = useId();
    const listboxId = `select-listbox-${uid}`;
    const optionIdPrefix = `select-option-${uid}`;
    const triggerId = id ?? `select-trigger-${uid}`;

    // Controlled vs uncontrolled
    const isControlled = value !== undefined;
    const [internalSelected, setInternalSelected] = useState<string[]>(() =>
      toArray(defaultValue)
    );
    const selectedValues = isControlled
      ? toArray(value)
      : internalSelected;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [searchValue, setSearchValue] = useState('');

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<SelectListboxHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge refs
    const mergedTriggerRef = (node: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    // Filtered options for searchable
    const displayOptions = searchable && searchValue
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchValue.toLowerCase())
        )
      : options;

    const openListbox = useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      // Set initial active index to first selected or first enabled
      const firstSelected = selectedValues.length > 0
        ? displayOptions.findIndex((o) => o.value === selectedValues[0])
        : -1;
      const firstEnabled = displayOptions.findIndex((o) => !o.disabled);
      setActiveIndex(firstSelected >= 0 ? firstSelected : firstEnabled);
    }, [disabled, selectedValues, displayOptions]);

    const closeListbox = useCallback(() => {
      setIsOpen(false);
      setSearchValue('');
      setActiveIndex(-1);
      // Return focus to trigger
      triggerRef.current?.focus();
    }, []);

    const toggleListbox = useCallback(() => {
      if (isOpen) {
        closeListbox();
      } else {
        openListbox();
      }
    }, [isOpen, openListbox, closeListbox]);

    const handleSelectOption = useCallback(
      (optionValue: string) => {
        let newSelected: string[];

        if (multiple) {
          if (selectedValues.includes(optionValue)) {
            newSelected = selectedValues.filter((v) => v !== optionValue);
          } else {
            newSelected = [...selectedValues, optionValue];
          }
        } else {
          newSelected = [optionValue];
        }

        if (!isControlled) {
          setInternalSelected(newSelected);
        }

        if (onChange) {
          onChange(multiple ? newSelected : newSelected[0] ?? '');
        }

        if (!multiple) {
          closeListbox();
        }
      },
      [multiple, selectedValues, isControlled, onChange, closeListbox]
    );

    // Focus the listbox when it opens
    useEffect(() => {
      if (isOpen) {
        // Defer to allow DOM to render
        requestAnimationFrame(() => {
          listboxRef.current?.focus();
        });
      }
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handlePointerDown = (e: PointerEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          closeListbox();
        }
      };

      document.addEventListener('pointerdown', handlePointerDown);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [isOpen, closeListbox]);

    const { handleTriggerKeyDown, handleListboxKeyDown } = useSelectKeyboard({
      options: displayOptions,
      activeIndex,
      setActiveIndex,
      onSelect: handleSelectOption,
      onClose: closeListbox,
      onOpen: openListbox,
      isOpen,
    });

    // Build display label
    const getDisplayLabel = () => {
      if (selectedValues.length === 0) return null;
      if (multiple) {
        const labels = options
          .filter((o) => selectedValues.includes(o.value))
          .map((o) => o.label);
        return labels.join(', ');
      }
      const selected = options.find((o) => o.value === selectedValues[0]);
      return selected?.label ?? null;
    };

    const displayLabel = getDisplayLabel();
    const activeDescendant =
      isOpen && activeIndex >= 0
        ? `${optionIdPrefix}-${activeIndex}`
        : undefined;

    const triggerClasses = [
      styles.trigger,
      error ? styles.error : '',
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <SelectContext.Provider
        value={{
          isOpen,
          selectedValues,
          activeDescendant: activeDescendant ?? null,
          listboxId,
          optionIdPrefix,
          multiple,
          onSelectOption: handleSelectOption,
          onToggle: toggleListbox,
          onClose: closeListbox,
        }}
      >
        <div
          ref={containerRef}
          style={{ position: 'relative', display: 'inline-block', width: '100%' }}
        >
          <button
            ref={mergedTriggerRef}
            id={triggerId}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeDescendant}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-disabled={disabled ? true : undefined}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            className={triggerClasses}
            onClick={toggleListbox}
            onKeyDown={handleTriggerKeyDown}
          >
            <span
              className={[
                styles.triggerValue,
                !displayLabel ? styles.triggerPlaceholder : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {displayLabel ?? placeholder}
            </span>
            <ChevronIcon open={isOpen} />
          </button>

          {isOpen && (
            <SelectListbox
              ref={listboxRef}
              options={displayOptions}
              selectedValues={selectedValues}
              activeIndex={activeIndex}
              listboxId={listboxId}
              optionIdPrefix={optionIdPrefix}
              multiple={multiple}
              onSelectOption={handleSelectOption}
              onActiveIndexChange={setActiveIndex}
              onKeyDown={handleListboxKeyDown}
              labelledBy={ariaLabelledBy ?? triggerId}
              searchable={searchable}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
          )}
        </div>
      </SelectContext.Provider>
    );
  }
);

Select.displayName = 'Select';

export default Select;