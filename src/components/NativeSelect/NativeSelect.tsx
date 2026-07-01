import React, { forwardRef } from 'react';
import styles from './NativeSelect.module.css';

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Whether the select is in an error/invalid state */
  error?: boolean;
  /** aria-label for accessibility when no visible label is provided */
  'aria-label'?: string;
  /** aria-labelledby for accessibility */
  'aria-labelledby'?: string;
  /** aria-describedby for accessibility */
  'aria-describedby'?: string;
}

const ChevronIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      children,
      className,
      error,
      disabled,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const selectClasses = [
      styles.select,
      error ? styles.error : '',
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.wrapper}>
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled}
          aria-invalid={ariaInvalid ?? (error ? true : undefined)}
          {...props}
        >
          {children}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronIcon />
        </span>
      </div>
    );
  }
);

NativeSelect.displayName = 'NativeSelect';

export default NativeSelect;