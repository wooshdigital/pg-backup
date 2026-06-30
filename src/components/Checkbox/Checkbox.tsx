import React, { useEffect, useRef, forwardRef, useId } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  /** Label text shown beside the checkbox */
  label?: React.ReactNode;
  /** Controlled checked state */
  checked?: boolean;
  /** Uncontrolled default checked state */
  defaultChecked?: boolean;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox has an error */
  hasError?: boolean;
  /** Name attribute for form submission */
  name?: string;
  /** Value attribute for form submission */
  value?: string;
  /** onChange handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Additional class name */
  className?: string;
  /** ID for the input element */
  id?: string;
  /** aria-describedby */
  'aria-describedby'?: string;
  /** aria-required */
  'aria-required'?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      checked,
      defaultChecked,
      indeterminate = false,
      disabled = false,
      hasError = false,
      name,
      value,
      onChange,
      className,
      id: idProp,
      'aria-describedby': ariaDescribedby,
      'aria-required': ariaRequired,
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const internalRef = useRef<HTMLInputElement>(null);

    // Merge refs
    const setRef = (node: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    // Set indeterminate via ref since it's not an HTML attribute
    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const wrapperClasses = [
      styles.wrapper,
      disabled ? styles.disabled : '',
      hasError ? styles.hasError : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label htmlFor={id} className={wrapperClasses}>
        <input
          ref={setRef}
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          className={styles.input}
          aria-describedby={ariaDescribedby}
          aria-required={ariaRequired}
          aria-invalid={hasError ? true : undefined}
        />
        <div className={styles.indicator} aria-hidden="true">
          {/* Checkmark SVG */}
          <svg
            className={styles.checkmark}
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1.5 5L4 7.5L8.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Indeterminate dash */}
          <div className={styles.indeterminateDash} aria-hidden="true" />
        </div>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';