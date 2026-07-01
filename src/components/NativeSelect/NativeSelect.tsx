import React, { forwardRef, useId } from 'react';
import styles from './NativeSelect.module.css';
import { classNames } from '../../utils/classNames';

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      disabled,
      id: idProp,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div
        className={classNames(
          styles.wrapper,
          fullWidth && styles.fullWidth,
          className
        )}
      >
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div
          className={classNames(
            styles.selectWrapper,
            error && styles.hasError,
            disabled && styles.disabled
          )}
        >
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={styles.select}
            {...rest}
          >
            {children}
          </select>
          <span className={styles.chevron} aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
    );
  }
);

NativeSelect.displayName = 'NativeSelect';

export default NativeSelect;