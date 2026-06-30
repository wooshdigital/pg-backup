import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { RadioGroupContext, RadioGroupContextValue } from './RadioGroupContext';
import styles from './RadioGroup.module.css';

export interface RadioGroupProps {
  /** Group label shown as legend */
  legend: React.ReactNode;
  /** Shared name for all radio inputs */
  name?: string;
  /** Controlled selected value */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** onChange handler — receives the new value */
  onChange?: (value: string) => void;
  /** Whether all radios are disabled */
  disabled?: boolean;
  /** Whether the group is required */
  required?: boolean;
  /** Layout direction */
  orientation?: 'vertical' | 'horizontal';
  /** Error message */
  errorMessage?: React.ReactNode;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Radio children */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  legend,
  name: nameProp,
  value: valueProp,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  orientation = 'vertical',
  errorMessage,
  helperText,
  children,
  className,
}) => {
  const generatedName = useId();
  const name = nameProp ?? generatedName;
  const errorId = useId();
  const helperId = useId();
  const legendId = useId();
  const groupRef = useRef<HTMLDivElement>(null);

  // Internal value for uncontrolled mode
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);

  // Determine effective value (controlled vs uncontrolled)
  const isControlled = valueProp !== undefined;
  const effectiveValue = isControlled ? valueProp : internalValue;

  // Roving tabindex: track which radio value is the current tab stop
  // Default: selected value, or first radio
  const [focusedValue, setFocusedValue] = useState<string | undefined>(
    effectiveValue
  );

  const handleChange = useCallback(
    (val: string) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      setFocusedValue(val);
      onChange?.(val);
    },
    [isControlled, onChange]
  );

  const handleFocus = useCallback((val: string) => {
    setFocusedValue(val);
  }, []);

  // Keyboard navigation: arrow keys move between enabled radio options
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      // Collect all enabled radio inputs in the group
      const inputs = Array.from(
        groupRef.current?.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]:not(:disabled)'
        ) ?? []
      );

      if (inputs.length === 0) return;

      const currentIndex = inputs.findIndex(
        (input) => input === document.activeElement || input.value === focusedValue
      );

      let nextIndex: number;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % inputs.length;
      } else {
        nextIndex = (currentIndex - 1 + inputs.length) % inputs.length;
      }

      const nextInput = inputs[nextIndex];
      nextInput.focus();

      // Also select the focused radio on arrow key navigation (standard radio behavior)
      const nextValue = nextInput.value;
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      setFocusedValue(nextValue);
      onChange?.(nextValue);
    },
    [focusedValue, isControlled, onChange]
  );

  const hasError = Boolean(errorMessage);
  const describedby = [hasError ? errorId : '', helperText && !hasError ? helperId : '']
    .filter(Boolean)
    .join(' ') || undefined;

  const groupClass = [
    styles.group,
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
  ]
    .filter(Boolean)
    .join(' ');

  const fieldsetClass = [styles.fieldset, className ?? ''].filter(Boolean).join(' ');

  const contextValue: RadioGroupContextValue = useMemo(
    () => ({
      name,
      value: effectiveValue,
      onChange: handleChange,
      disabled,
      required,
      focusedValue: focusedValue ?? effectiveValue,
      onFocus: handleFocus,
    }),
    [name, effectiveValue, handleChange, disabled, required, focusedValue, handleFocus]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <fieldset
        className={fieldsetClass}
        aria-required={required ? true : undefined}
        aria-describedby={describedby}
        aria-invalid={hasError ? true : undefined}
      >
        <legend id={legendId} className={styles.legend}>
          {legend}
          {required && <span aria-hidden="true"> *</span>}
        </legend>
        <div
          ref={groupRef}
          role="radiogroup"
          aria-labelledby={legendId}
          className={groupClass}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
        {helperText && !hasError && (
          <p id={helperId} className={styles.helperText}>
            {helperText}
          </p>
        )}
        {hasError && (
          <p id={errorId} className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = 'RadioGroup';