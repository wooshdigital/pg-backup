import React, { forwardRef, useContext, useId } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './TextInput.module.css';

export type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning';
  /** Element rendered before the input */
  prefix?: React.ReactNode;
  /** Element rendered after the input */
  suffix?: React.ReactNode;
  /** Maps to the inputmode attribute for virtual keyboard hints */
  inputMode?: InputMode;
  /** Additional className for the wrapper */
  wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      validationState,
      prefix,
      suffix,
      inputMode,
      wrapperClassName,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      id: idProp,
      disabled,
      readOnly,
      ...rest
    },
    ref
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const inputId = idProp ?? ctx?.inputId ?? generatedId;

    // Build aria-describedby from context + any caller-supplied value
    const describedByParts: string[] = [];
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy);
    const computedDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    // Derive invalid state from context or prop
    const isInvalid =
      ariaInvalid !== undefined
        ? ariaInvalid
        : ctx?.hasError ?? validationState === 'error'
        ? true
        : undefined;

    const isRequired = ariaRequired !== undefined ? ariaRequired : ctx?.required;

    const resolvedState = validationState ?? (ctx?.hasError ? 'error' : undefined);

    const wrapperClasses = [
      styles.wrapper,
      resolvedState === 'error' && styles.error,
      resolvedState === 'success' && styles.success,
      resolvedState === 'warning' && styles.warning,
      disabled && styles.disabled,
      readOnly && styles.readonly,
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
          disabled={disabled}
          readOnly={readOnly}
          aria-describedby={computedDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
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

export default TextInput;