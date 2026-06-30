import React, { useId } from 'react';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupProps {
  legend: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  helperText?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  disabled?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  legend,
  children,
  required,
  error,
  helperText,
  orientation = 'vertical',
  className,
  disabled,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperTextId = `${id}-helper`;

  const describedBy = [
    helperText ? helperTextId : '',
    error ? errorId : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      className={[styles.fieldset, className ?? ''].filter(Boolean).join(' ')}
      aria-required={required ? true : undefined}
      aria-describedby={describedBy || undefined}
      aria-errormessage={error ? errorId : undefined}
      disabled={disabled}
    >
      <legend
        className={[styles.legend, required ? styles.required : '']
          .filter(Boolean)
          .join(' ')}
      >
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>

      <div
        className={[
          styles.group,
          orientation === 'horizontal' ? styles.horizontal : '',
        ]
          .filter(Boolean)
          .join(' ')}
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
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';