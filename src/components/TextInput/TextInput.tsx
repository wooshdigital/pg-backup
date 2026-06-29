import React, { forwardRef, useContext, useId } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './TextInput.module.css';

export type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning';
  /** Element rendered before the input (icon, text, etc.) */
  prefix?: React.ReactNode;
  /** Element rendered after the input (icon, button, etc.) */
  suffix?: React.ReactNode;
  /** Override the inputmode attribute for virtual keyboards */
  inputMode?: InputMode;
  /** Additional CSS class for the wrapper */
  wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      validationState,
      prefix,
      suffix,
      inputMode,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const inputId = idProp ?? ctx?.inputId ?? generatedId;

    // Combine caller's aria-describedby with context ids
    const describedByParts: string[] = [];
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy);
    const combinedDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const invalid =
      ariaInvalid !== undefined
        ? ariaInvalid
        : ctx?.hasError
        ? true
        : undefined;

    const required =
      ariaRequired !== undefined
        ? ariaRequired
        : ctx?.required
        ? true
        : undefined;

    const effectiveValidationState = validationState ?? (ctx?.hasError ? 'error' : undefined);

    const wrapperClasses = [
      styles.wrapper,
      effectiveValidationState === 'error' && styles.error,
      effectiveValidationState === 'success' && styles.success,
      effectiveValidationState === 'warning' && styles.warning,
      rest.disabled && styles.disabled,
      rest.readOnly && styles.readonly,
      prefix && styles.hasPrefix,
      suffix && styles.hasSuffix,
      wrapperClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [styles.input, className].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          inputMode={inputMode}
          aria-describedby={combinedDescribedBy}
          aria-invalid={invalid}
          aria-required={required}
          {...rest}
        />
        {suffix && (
          <span className={styles.suffix} aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';