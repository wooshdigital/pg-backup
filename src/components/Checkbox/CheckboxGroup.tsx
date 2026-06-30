import React, { type ReactNode } from 'react';
import styles from './CheckboxGroup.module.css';
import { classNames } from '../../utils/classNames';

export interface CheckboxGroupProps {
  /** Group label rendered as a legend */
  legend: ReactNode;
  /** Whether at least one checkbox is required */
  required?: boolean;
  /** Helper text for the group */
  helperText?: string;
  /** Error message for the group */
  error?: string;
  /** Layout direction */
  orientation?: 'vertical' | 'horizontal';
  /** Checkbox children */
  children: ReactNode;
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  legend,
  required = false,
  helperText,
  error,
  orientation = 'vertical',
  children,
  className,
}) => {
  const groupId = React.useId();
  const helperTextId = helperText ? `${groupId}-helper` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;

  const describedByIds = [helperTextId, errorId].filter(Boolean).join(' ');

  return (
    <fieldset
      className={classNames(styles.group, className)}
      aria-required={required || undefined}
      aria-describedby={describedByIds || undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className={classNames(styles.legend, required && styles.required)}>
        {legend}
      </legend>
      <div className={classNames(styles.items, orientation === 'horizontal' && styles.horizontal)}>
        {children}
      </div>
      {helperText && !error && (
        <span id={helperTextId} className={styles.helperText}>
          {helperText}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';