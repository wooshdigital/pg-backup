import React, { forwardRef, useCallback, useId, useRef, useState, useEffect } from 'react';
import { SelectContext } from './SelectContext';
import type { SelectOption } from './SelectContext';
import { SelectListbox } from './SelectListbox';
import styles from './Select.module.css';
import { classNames } from '../../utils/classNames';

export interface SelectProps {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
  fullWidth?: boolean;
  id?: string;
  name?: string;
  className?: string;
  maxListHeight?: number;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      options,
      placeholder = 'Select...',
      label,
      error,
      helperText,
      disabled = false,
      multiple = false,
      fullWidth = false,
      id: idProp,
      className,
      maxListHeight = 280,
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const listboxId = `${id}-listbox`;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Merge external and internal refs
    const setRef = useCallback(
      (el: HTMLButtonElement | null) => {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [ref]
    );

    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState<string[]>(() => {
      const def = defaultValue;
      if (def === undefined) return [];
      return Array.isArray(def) ? def : [def];
    });

    const selectedValues = isControlled
      ? Array.isArray(valueProp)
        ? valueProp
        : valueProp
        ? [valueProp]
        : []
      : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [activeDescendant, setActiveDescendant] = useState<string | undefined>(undefined);

    const onOpen = useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      // Set active index to first selected or first enabled
      const firstSelectedIndex = selectedValues.length > 0
        ? options.findIndex((o) => o.value === selectedValues[0])
        : -1;
      const firstEnabled = options.findIndex((o) => !o.disabled);
      setActiveIndex(firstSelectedIndex >= 0 ? firstSelectedIndex : firstEnabled);
    }, [disabled, selectedValues, options]);

    const onClose = useCallback(() => {
      setIsOpen(false);
      setActiveIndex(-1);
      setActiveDescendant(undefined);
      // Return focus to trigger
      triggerRef.current?.focus();
    }, []);

    const onToggle = useCallback(() => {
      if (isOpen) onClose();
      else onOpen();
    }, [isOpen, onOpen, onClose]);

    const onSelect = useCallback(
      (value: string) => {
        let next: string[];
        if (multiple) {
          next = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        } else {
          next = [value];
        }

        if (!isControlled) {
          setInternalValue(next);
        }

        if (onChange) {
          onChange(multiple ? next : next[0] ?? '');
        }

        if (!multiple) {
          onClose();
        }
      },
      [multiple, selectedValues, isControlled, onChange, onClose]
    );

    const handleSetActiveIndex = useCallback(
      (index: number) => {
        setActiveIndex(index);
        if (index >= 0 && index < options.length) {
          setActiveDescendant(`${listboxId}-option-${index}`);
        } else {
          setActiveDescendant(undefined);
        }
      },
      [options.length, listboxId]
    );

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        const trigger = triggerRef.current;
        const listbox = document.getElementById(listboxId);
        if (
          trigger && !trigger.contains(e.target as Node) &&
          listbox && !listbox.contains(e.target as Node)
        ) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, listboxId, onClose]);

    const displayLabel = selectedValues.length > 0
      ? multiple
        ? selectedValues
            .map((v) => options.find((o) => o.value === v)?.label ?? v)
            .join(', ')
        : options.find((o) => o.value === selectedValues[0])?.label ?? selectedValues[0]
      : placeholder;

    const hasValue = selectedValues.length > 0;

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    const contextValue = {
      isOpen,
      selectedValues,
      activeDescendant,
      multiple,
      listboxId,
      disabled,
      onOpen,
      onClose,
      onToggle,
      onSelect,
      setActiveDescendant: (id: string | undefined) => setActiveDescendant(id),
      options,
    };

    return (
      <SelectContext.Provider value={contextValue}>
        <div className={classNames(styles.root, fullWidth && styles.fullWidth, className)}>
          {label && (
            <label
              id={`${id}-label`}
              htmlFor={id}
              className={styles.label}
            >
              {label}
            </label>
          )}
          <div className={classNames(styles.triggerWrapper, error && styles.hasError)}>
            <button
              ref={setRef}
              id={id}
              type="button"
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-activedescendant={activeDescendant}
              aria-labelledby={label ? `${id}-label` : undefined}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              aria-disabled={disabled || undefined}
              disabled={disabled}
              className={classNames(
                styles.trigger,
                isOpen && styles.open,
                !hasValue && styles.placeholder
              )}
              onClick={onToggle}
            >
              <span className={styles.triggerText}>{displayLabel}</span>
              <span
                className={classNames(styles.chevron, isOpen && styles.chevronOpen)}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
                activeIndex={activeIndex}
                onSetActiveIndex={handleSetActiveIndex}
                maxHeight={maxListHeight}
                triggerRef={triggerRef}
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
        </div>
      </SelectContext.Provider>
    );
  }
);

Select.displayName = 'Select';