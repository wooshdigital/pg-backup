import React, { forwardRef, useContext, useId } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './TextInput.module.css';

export type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning';
  /** Element to render before the input (icon, symbol, etc.) */
  prefix?: React.ReactNode;
  /** Element to render after the input (icon, button, etc.) */
  suffix?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
  /** inputMode for virtual keyboard hint */
  inputMode?: InputMode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      validationState,
      prefix,
      suffix,
      fullWidth = false,
      className,
      id: idProp,
      'aria-describedby': ariaDescribedByProp,
      'aria-invalid': ariaInvalidProp,
      'aria-required': ariaRequiredProp,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldCtx = useContext(FormFieldContext);

    const id = idProp ?? fieldCtx?.inputId ?? generatedId;

    // Combine describedby from prop and context
    const describedByParts: string[] = [];
    if (ariaDescribedByProp) describedByParts.push(ariaDescribedByProp);
    if (fieldCtx?.helperId) describedByParts.push(fieldCtx.helperId);
    if (fieldCtx?.errorId) describedByParts.push(fieldCtx.errorId);
    const ariaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const isInvalid =
      ariaInvalidProp != null
        ? ariaInvalidProp
        : validationState === 'error' || fieldCtx?.hasError
        ? true
        : undefined;

    const isRequired = ariaRequiredProp ?? fieldCtx?.required;

    const wrapperClasses = [
      styles.wrapper,
      fullWidth ? styles.fullWidth : '',
      disabled ? styles.disabled : '',
      validationState === 'error' || fieldCtx?.hasError ? styles.error : '',
      validationState === 'success' ? styles.success : '',
      validationState === 'warning' ? styles.warning : '',
      prefix ? styles.hasPrefix : '',
      suffix ? styles.hasSuffix : '',
      className ?? '',
    ]
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
          {...rest}
          ref={ref}
          id={id}
          disabled={disabled}
          className={styles.input}
          aria-describedby={ariaDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
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