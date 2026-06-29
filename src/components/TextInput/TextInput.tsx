import React, { forwardRef, useContext, useId } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './TextInput.module.css';

export type TextInputInputMode =
  | 'none'
  | 'text'
  | 'decimal'
  | 'numeric'
  | 'tel'
  | 'search'
  | 'email'
  | 'url';

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Visual state */
  validationState?: 'error' | 'success' | 'warning' | 'none';
  /** Slot rendered before the input text */
  prefix?: React.ReactNode;
  /** Slot rendered after the input text */
  suffix?: React.ReactNode;
  /** Maps to the inputmode attribute for virtual keyboards */
  inputMode?: TextInputInputMode;
  /** Additional class name for the wrapper */
  wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      validationState,
      prefix,
      suffix,
      wrapperClassName,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      disabled,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldCtx = useContext(FormFieldContext);

    const inputId = idProp ?? fieldCtx?.inputId ?? generatedId;

    // Merge aria-describedby from context and prop
    const describedByParts: string[] = [];
    if (fieldCtx?.helperId) describedByParts.push(fieldCtx.helperId);
    if (fieldCtx?.errorId) describedByParts.push(fieldCtx.errorId);
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy);
    const mergedDescribedBy =
      describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const isInvalid =
      ariaInvalid !== undefined
        ? ariaInvalid
        : fieldCtx?.hasError
        ? true
        : undefined;

    const isRequired =
      ariaRequired !== undefined
        ? ariaRequired
        : fieldCtx?.required
        ? true
        : undefined;

    const resolvedValidationState =
      validationState ?? (fieldCtx?.hasError ? 'error' : 'none');

    const wrapperClasses = [
      styles.wrapper,
      resolvedValidationState !== 'none'
        ? styles[`wrapper--${resolvedValidationState}`]
        : '',
      disabled ? styles['wrapper--disabled'] : '',
      prefix ? styles['wrapper--has-prefix'] : '',
      suffix ? styles['wrapper--has-suffix'] : '',
      wrapperClassName ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [styles.input, className ?? '']
      .filter(Boolean)
      .join(' ');

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
          disabled={disabled}
          aria-describedby={mergedDescribedBy}
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