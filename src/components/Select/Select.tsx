import React, {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  useEffect,
} from 'react';
import { SelectContext } from './SelectContext';
import { SelectListbox } from './SelectListbox';
import type { SelectOption } from './SelectContext';
import { useSelectKeyboard } from './useSelectKeyboard';
import styles from './Select.module.css';
import { classNames } from '../../utils/classNames';

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  multiple?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value: valueProp,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      helperText,
      multiple = false,
      disabled = false,
      fullWidth = false,
      id: idProp,
      name,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const listboxId = `${id}-listbox`;
    const labelId = `${id}-label`;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const triggerRef = useRef<HTMLButtonElement>(null);

    const isControlled = valueProp !== undefined;
    const [internalValues, setInternalValues] = useState<string[]>(() => {
      if (defaultValue !== undefined) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });

    const selectedValues = isControlled
      ? Array.isArray(valueProp)
        ? valueProp
        : valueProp
        ? [valueProp]
        : []
      : internalValues;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const getOptionId = useCallback(
      (value: string) => `${id}-option-${value.replace(/\s+/g, '-')}`,
      [id]
    );

    const activeDescendant =
      activeIndex >= 0 && activeIndex < options.length
        ? getOptionId(options[activeIndex].value)
        : undefined;

    const isSelected = useCallback(
      (value: string) => selectedValues.includes(value),
      [selectedValues]
    );

    const selectOption = useCallback(
      (value: string) => {
        let newValues: string[];
        if (multiple) {
          if (selectedValues.includes(value)) {
            newValues = selectedValues.filter((v) => v !== value);
          } else {
            newValues = [...selectedValues, value];
          }
        } else {
          newValues = [value];
          setIsOpen(false);
          triggerRef.current?.focus();
        }

        if (!isControlled) {
          setInternalValues(newValues);
        }
        onChange?.(multiple ? newValues : newValues[0] ?? '');
      },
      [multiple, selectedValues, isControlled, onChange]
    );

    const openSelect = useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      // Set active index to first selected or first enabled
      const firstSelected = options.findIndex(
        (opt) => !opt.disabled && selectedValues.includes(opt.value)
      );
      const firstEnabled = options.findIndex((opt) => !opt.disabled);
      setActiveIndex(firstSelected >= 0 ? firstSelected : firstEnabled);
    }, [disabled, options, selectedValues]);

    const closeSelect = useCallback(() => {
      setIsOpen(false);
      triggerRef.current?.focus();
    }, []);

    const handleSelectIndex = useCallback(
      (index: number) => {
        const option = options[index];
        if (option && !option.disabled) {
          selectOption(option.value);
        }
      },
      [options, selectOption]
    );

    const { handleTriggerKeyDown, handleListboxKeyDown } = useSelectKeyboard({
      options,
      activeIndex,
      isOpen,
      onOpen: openSelect,
      onClose: closeSelect,
      onSelectIndex: handleSelectIndex,
      onSetActiveIndex: setActiveIndex,
    });

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as Node;
        const triggerEl = triggerRef.current;
        const listboxEl = document.getElementById(listboxId);
        if (
          triggerEl &&
          !triggerEl.contains(target) &&
          listboxEl &&
          !listboxEl.contains(target)
        ) {
          closeSelect();
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen, listboxId, closeSelect]);

    const displayValue = () => {
      if (selectedValues.length === 0) return placeholder;
      if (multiple) {
        if (selectedValues.length === 1) {
          return options.find((o) => o.value === selectedValues[0])?.label ?? placeholder;
        }
        return `${selectedValues.length} selected`;
      }
      return options.find((o) => o.value === selectedValues[0])?.label ?? placeholder;
    };

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    const computedAriaLabelledBy = [
      label ? labelId : null,
      ariaLabelledBy ?? null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <SelectContext.Provider
        value={{
          isOpen,
          selectedValues,
          activeDescendant,
          multiple,
          listboxId,
          toggleOpen: isOpen ? closeSelect : openSelect,
          closeSelect,
          selectOption,
          setActiveDescendant: () => {},
          isSelected,
          getOptionId,
        }}
      >
        <div
          className={classNames(
            styles.container,
            fullWidth && styles.fullWidth,
            className
          )}
        >
          {label && (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          )}
          <div className={styles.triggerWrapper}>
            <button
              ref={(node) => {
                (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
              }}
              id={id}
              type="button"
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls={listboxId}
              aria-activedescendant={activeDescendant}
              aria-label={!label ? ariaLabel : undefined}
              aria-labelledby={computedAriaLabelledBy}
              aria-describedby={describedBy}
              aria-invalid={error ? 'true' : undefined}
              aria-disabled={disabled}
              disabled={disabled}
              className={classNames(
                styles.trigger,
                isOpen && styles.triggerOpen,
                error && styles.triggerError,
                !selectedValues.length && styles.placeholder
              )}
              onClick={() => (isOpen ? closeSelect() : openSelect())}
              onKeyDown={handleTriggerKeyDown}
            >
              <span className={styles.triggerText}>{displayValue()}</span>
              <span className={styles.chevron} aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {isOpen && (
              <SelectListbox
                options={options}
                activeIndex={activeIndex}
                onKeyDown={handleListboxKeyDown}
                onSetActiveIndex={setActiveIndex}
              />
            )}
          </div>

          {error && (
            <span id={errorId} className={styles.errorMessage} role="alert">
              {error}
            </span>
          )}
          {helperText && !error && (
            <span id={helperId} className={styles.helperText}>
              {helperText}
            </span>
          )}

          {/* Hidden native select for form submission */}
          {name && (
            <select
              name={name}
              multiple={multiple}
              value={multiple ? selectedValues : selectedValues[0] ?? ''}
              onChange={() => {}}
              aria-hidden="true"
              tabIndex={-1}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </SelectContext.Provider>
    );
  }
);

Select.displayName = 'Select';

export default Select;