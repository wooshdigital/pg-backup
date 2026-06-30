import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  indeterminate?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      indeterminate = false,
      error,
      helperText,
      disabled,
      id: idProp,
      className,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const helperTextId = `${id}-helper`;

    const internalRef = useRef<HTMLInputElement>(null);

    // Merge refs
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        (internalRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLInputElement | null>
          ).current = node;
        }
      },
      [forwardedRef]
    );

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const wrapperClass = [
      styles.wrapper,
      disabled ? styles.disabled : '',
      error ? styles.error : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClass = [styles.input, indeterminate ? styles.indeterminate : '']
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClass}>
        <label htmlFor={id} className={wrapperClass} style={{ margin: 0 }}>
          <input
            {...props}
            ref={setRef}
            id={id}
            type="checkbox"
            disabled={disabled}
            className={inputClass}
            aria-describedby={
              helperText || error ? helperTextId : undefined
            }
            aria-invalid={error ? true : undefined}
            onChange={onChange}
          />
          <span className={styles.indicator} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </label>
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
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';