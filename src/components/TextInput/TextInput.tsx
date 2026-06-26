import React, { forwardRef, useContext, useId } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './TextInput.module.css';

export type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning';
  /** Element rendered before the input (e.g. an icon) */
  prefix?: React.ReactNode;
  /** Element rendered after the input (e.g. an icon or button) */
  suffix?: React.ReactNode;
  /** Maps to the inputmode attribute for virtual keyboard hints */
  inputMode?: InputMode;
  /** Additional className for the wrapper div */
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
      disabled,
      required,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const fallbackId = useId();
    const fieldCtx = useContext(FormFieldContext);

    // Auto-wire from FormFieldContext when available
    const id = idProp ?? fieldCtx?.inputId ?? fallbackId;

    // Build aria-describedby by merging context ids + caller-supplied value
    const describedByParts: string[] = [];
    if (fieldCtx?.helperId) describedByParts.push(fieldCtx.helperId);
    if (fieldCtx?.errorId) describedByParts.push(fieldCtx.errorId);
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy);
    const mergedDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const isInvalid =
      ariaInvalid !== undefined
        ? ariaInvalid
        : validationState === 'error' || fieldCtx?.hasError
        ? true
        : undefined;

    const isRequired = ariaRequired !== undefined ? ariaRequired : required ?? fieldCtx?.required;

    const wrapperClasses = [
      styles.wrapper,
      prefix ? styles.hasPrefix : '',
      suffix ? styles.hasSuffix : '',
      validationState === 'error' || fieldCtx?.hasError ? styles.stateError : '',
      validationState === 'success' ? styles.stateSuccess : '',
      validationState === 'warning' ? styles.stateWarning : '',
      disabled ? styles.disabled : '',
      wrapperClassName ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [styles.input, className ?? ''].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-describedby={mergedDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          inputMode={inputMode}
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