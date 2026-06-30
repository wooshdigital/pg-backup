import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';
import styles from './Checkbox.module.css';
import { classNames } from '../../utils/classNames';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Label text for the checkbox */
  label?: React.ReactNode;
  /** Helper text displayed below the label */
  helperText?: string;
  /** Error message — also sets aria-invalid */
  error?: string;
  /** Indeterminate state (mixed) */
  indeterminate?: boolean;
  /** Change handler receives the new checked boolean */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      indeterminate = false,
      disabled = false,
      checked,
      defaultChecked,
      onChange,
      id,
      className,
      'aria-describedby': ariaDescribedby,
      ...rest
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose the underlying input element via ref
    useImperativeHandle(ref, () => inputRef.current!);

    // Sync indeterminate property (not an HTML attribute, must be set via JS)
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedByIds = [ariaDescribedby, helperTextId, errorId]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked, e);
    };

    return (
      <div className={classNames(styles.wrapper, disabled && styles.disabled, className)}>
        <label
          htmlFor={inputId}
          className={classNames(styles.wrapper, disabled && styles.disabled)}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <input
            {...rest}
            ref={inputRef}
            id={inputId}
            type="checkbox"
            className={styles.input}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedByIds || undefined}
            onChange={handleChange}
          />
          <div
            className={classNames(
              styles.indicator,
              indeterminate && styles.indeterminate,
              error && styles.hasError
            )}
            aria-hidden="true"
          >
            {/* Checkmark */}
            <svg className={styles.checkmark} viewBox="0 0 12 12" aria-hidden="true">
              <polyline points="1.5,6 4.5,9 10.5,3" />
            </svg>
            {/* Indeterminate dash */}
            <div className={styles.dash} />
          </div>
          {label && <span className={styles.label}>{label}</span>}
        </label>
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
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';