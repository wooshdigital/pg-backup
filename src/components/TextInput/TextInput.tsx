import React, { forwardRef, useContext, useId } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './TextInput.module.css';
import { classNames } from '../../utils/classNames';

export type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Visual variant */
  variant?: 'default' | 'error' | 'success';
  /** Element(s) rendered before the input (e.g. icon) */
  prefix?: React.ReactNode;
  /** Element(s) rendered after the input (e.g. icon) */
  suffix?: React.ReactNode;
  /** Override inputMode explicitly */
  inputMode?: InputMode;
  /** Extra class for the wrapper div */
  wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      variant,
      prefix,
      suffix,
      inputMode,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      id: idProp,
      ...rest
    },
    ref,
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const id = idProp ?? ctx?.inputId ?? generatedId;

    // Build aria-describedby from context + any caller-supplied value
    const describedByParts: string[] = [];
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    if (ariaDescribedby) describedByParts.push(ariaDescribedby);
    const computedDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const isInvalid = ariaInvalid ?? (ctx?.hasError ? true : undefined);
    const isRequired = ariaRequired ?? ctx?.required ?? undefined;

    const resolvedVariant = variant ?? (ctx?.hasError ? 'error' : 'default');

    const wrapperClass = classNames(
      styles.wrapper,
      prefix ? styles.hasPrefix : undefined,
      suffix ? styles.hasSuffix : undefined,
      styles[resolvedVariant] ?? undefined,
      wrapperClassName,
    );

    const inputClass = classNames(styles.input, className);

    return (
      <div className={wrapperClass}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={inputClass}
          inputMode={inputMode}
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
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;