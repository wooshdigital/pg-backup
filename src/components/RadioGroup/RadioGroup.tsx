import React, { useCallback, useId, useRef, useState } from 'react';
import { RadioGroupContext } from './RadioGroupContext';
import styles from './RadioGroup.module.css';

export interface RadioGroupProps {
  legend: React.ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  layout?: 'vertical' | 'horizontal';
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  legend,
  name: nameProp,
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  error,
  helperText,
  layout = 'vertical',
  children,
  className,
}) => {
  const generatedName = useId();
  const name = nameProp ?? generatedName;
  const groupId = useId();
  const legendId = `${groupId}-legend`;
  const helperTextId = `${groupId}-helper`;

  // For roving tabindex, track which radio is "focused" (has tabIndex=0)
  // Default to the selected value, then defaultValue, then undefined (first radio will handle it)
  const [focusedValue, setFocusedValue] = useState<string | undefined>(
    value ?? defaultValue
  );

  const handleChange = useCallback(
    (val: string) => {
      setFocusedValue(val);
      onChange?.(val);
    },
    [onChange]
  );

  const fieldsetClass = [
    styles.fieldset,
    error ? styles.error : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value,
        defaultValue,
        onChange: handleChange,
        disabled,
        focusedValue,
        setFocusedValue,
      }}
    >
      <fieldset
        className={fieldsetClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={helperText || error ? helperTextId : undefined}
        aria-required={required ? true : undefined}
      >
        <legend
          id={legendId}
          className={[styles.legend, required ? styles.required : '']
            .filter(Boolean)
            .join(' ')}
        >
          {legend}
          {required && (
            <span
              aria-hidden="true"
              style={{ color: 'var(--color-error, #ef4444)' }}
            >
              {' '}
              *
            </span>
          )}
        </legend>
        <div
          role="radiogroup"
          aria-labelledby={legendId}
          className={[
            styles.list,
            layout === 'horizontal' ? styles.horizontal : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
        {(helperText || error) && (
          <span
            id={helperTextId}
            className={[
              styles.helperText,
              error ? styles.errorText : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role={error ? 'alert' : undefined}
          >
            {error ?? helperText}
          </span>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  );
};