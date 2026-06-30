import React, { useId } from 'react';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupProps {
  /** Legend / label for the group */
  legend: React.ReactNode;
  /** Layout direction */
  orientation?: 'vertical' | 'horizontal';
  /** Whether the group is required */
  required?: boolean;
  /** Error message to display */
  errorMessage?: React.ReactNode;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Children (Checkbox components) */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  legend,
  orientation = 'vertical',
  required = false,
  errorMessage,
  helperText,
  children,
  className,
}) => {
  const errorId = useId();
  const helperId = useId();

  const hasError = Boolean(errorMessage);
  const itemsClass = [
    styles.items,
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
  ]
    .filter(Boolean)
    .join(' ');

  const groupClass = [styles.group, className ?? ''].filter(Boolean).join(' ');

  // Build aria-describedby from active descriptors
  const describedby = [hasError ? errorId : '', helperText ? helperId : '']
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <fieldset
      className={groupClass}
      aria-required={required ? true : undefined}
      aria-describedby={describedby}
      aria-invalid={hasError ? true : undefined}
    >
      <legend className={styles.legend}>
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      <div className={itemsClass} role="group">
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
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';