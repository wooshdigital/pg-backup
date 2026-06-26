import React, { useContext, useId } from 'react';
import styles from './TextInput.module.css';
import { FormFieldContext } from '../FormField/FormFieldContext';

export type ValidationState = 'default' | 'error' | 'success';

export type InputMode =
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
  /** Validation state – drives border colour and aria-invalid */
  validationState?: ValidationState;
  /** Content rendered to the left of the input text (icon, symbol…) */
  prefix?: React.ReactNode;
  /** Content rendered to the right of the input text (icon, symbol…) */
  suffix?: React.ReactNode;
  /** Additional class applied to the outer wrapper div */
  wrapperClassName?: string;
  /**
   * inputMode prop for virtual-keyboard hints.
   * Mapped directly onto the native inputmode attribute.
   */
  inputMode?: InputMode;
}

/**
 * Accessible text input that auto-wires ARIA attributes from FormFieldContext.
 *
 * - Wraps a native <input> – all standard HTMLInputAttributes are forwarded.
 * - Picks up `helperId`, `errorId`, `required`, and `invalid` from the
 *   nearest FormFieldContext when present.
 * - Supports prefix/suffix icon slots.
 * - Supports controlled and uncontrolled modes.
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      validationState = 'default',
      prefix,
      suffix,
      wrapperClassName,
      className,
      id: idProp,
      'aria-describedby': ariaDescribedByProp,
      'aria-invalid': ariaInvalidProp,
      'aria-required': ariaRequiredProp,
      inputMode,
      disabled,
      readOnly,
      ...rest
    },
    ref,
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const inputId = idProp ?? ctx?.inputId ?? generatedId;

    // Merge describedby: explicit prop → context helpers
    const describedByParts: string[] = [];
    if (ariaDescribedByProp) describedByParts.push(ariaDescribedByProp);
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    const ariaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    // aria-invalid: explicit prop > context > validationState
    const isInvalid =
      ariaInvalidProp !== undefined
        ? ariaInvalidProp
        : ctx?.invalid !== undefined
        ? ctx.invalid
        : validationState === 'error';

    // aria-required: explicit prop > context
    const isRequired =
      ariaRequiredProp !== undefined
        ? ariaRequiredProp
        : ctx?.required !== undefined
        ? ctx.required
        : rest.required;

    const inputClasses = [
      styles.input,
      validationState === 'error' || isInvalid ? styles.inputError : '',
      validationState === 'success' ? styles.inputSuccess : '',
      prefix ? styles.hasPrefix : '',
      suffix ? styles.hasSuffix : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={[styles.inputWrapper, wrapperClassName].filter(Boolean).join(' ')}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-describedby={ariaDescribedBy}
          aria-invalid={isInvalid || undefined}
          aria-required={isRequired || undefined}
          inputMode={inputMode}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />
        {suffix && (
          <span className={styles.suffix} aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;