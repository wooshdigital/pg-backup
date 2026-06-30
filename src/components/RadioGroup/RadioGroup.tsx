import React, { useId, useRef, useCallback, useState } from 'react';
import styles from './RadioGroup.module.css';
import { RadioGroupContext } from './RadioGroupContext';

export interface RadioGroupProps {
  legend: React.ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  legend,
  name: nameProp,
  value: valueProp,
  defaultValue,
  onChange,
  children,
  required,
  disabled,
  error,
  helperText,
  orientation = 'vertical',
  className,
}) => {
  const autoId = useId();
  const name = nameProp ?? autoId;
  const legendId = `${name}-legend`;
  const errorId = `${name}-error`;
  const helperTextId = `${name}-helper`;

  // Uncontrolled internal value
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const [focusedValue, setFocusedValue] = useState('');

  const handleChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const inputs = Array.from(
        groupRef.current?.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]:not(:disabled)',
        ) ?? [],
      );
      if (inputs.length === 0) return;

      const currentIndex = inputs.findIndex((inp) => inp === document.activeElement);

      let nextIndex: number | null = null;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = currentIndex < inputs.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : inputs.length - 1;
      }

      if (nextIndex !== null) {
        const nextInput = inputs[nextIndex];
        nextInput.focus();
        // Select the focused radio (standard radio behavior)
        nextInput.checked = true;
        handleChange(nextInput.value);
      }
    },
    [handleChange],
  );

  const describedBy = [
    helperText ? helperTextId : '',
    error ? errorId : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value,
        onChange: handleChange,
        disabled,
        focusedValue,
        setFocusedValue,
      }}
    >
      <fieldset
        className={[styles.fieldset, className ?? ''].filter(Boolean).join(' ')}
        aria-required={required ? true : undefined}
        aria-describedby={describedBy || undefined}
        aria-errormessage={error ? errorId : undefined}
        disabled={disabled}
      >
        <legend
          id={legendId}
          className={[styles.legend, required ? styles.required : '']
            .filter(Boolean)
            .join(' ')}
        >
          {legend}
          {required && <span aria-hidden="true"> *</span>}
        </legend>

        <div
          ref={groupRef}
          role="radiogroup"
          aria-labelledby={legendId}
          aria-describedby={describedBy || undefined}
          className={[
            styles.group,
            orientation === 'horizontal' ? styles.horizontal : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>

        {helperText && !error && (
          <p id={helperTextId} className={styles.helperText}>
            {helperText}
          </p>
        )}

        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = 'RadioGroup';