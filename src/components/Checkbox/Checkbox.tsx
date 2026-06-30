import React, { forwardRef, useEffect, useRef, useId } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      indeterminate = false,
      className,
      wrapperClassName,
      disabled,
      id: idProp,
      ...rest
    },
    forwardedRef,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const internalRef = useRef<HTMLInputElement>(null);

    // Merge refs
    const setRef = (el: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      }
    };

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const indicatorClasses = [
      styles.indicator,
      indeterminate ? styles.indeterminate : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={[styles.wrapper, disabled ? styles.disabled : '', wrapperClassName ?? ''].filter(Boolean).join(' ')}>
        <label htmlFor={id} className={styles.wrapper} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <input
            ref={setRef}
            type="checkbox"
            id={id}
            disabled={disabled}
            className={styles.input}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [description ? `${id}-description` : '', error ? `${id}-error` : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            {...rest}
          />
          <div className={indicatorClasses} aria-hidden="true">
            {indeterminate ? (
              <div className={styles.indeterminateIcon} />
            ) : (
              <svg
                className={styles.checkIcon}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          {(label || description) && (
            <span className={styles.labelContent}>
              {label && <span className={styles.label}>{label}</span>}
              {description && (
                <span id={`${id}-description`} className={styles.description}>
                  {description}
                </span>
              )}
            </span>
          )}
        </label>
        {error && (
          <span id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';