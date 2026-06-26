import React, { useCallback, useContext, useEffect, useId, useRef } from 'react';
import styles from './Textarea.module.css';
import { FormFieldContext } from '../FormField/FormFieldContext';
import type { ValidationState } from '../TextInput/TextInput';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Validation state – drives border colour and aria-invalid */
  validationState?: ValidationState;
  /**
   * When true the textarea grows to fit its content via ResizeObserver.
   * Manual resize handle is hidden.
   */
  autoResize?: boolean;
  /**
   * Disable manual resizing without enabling autoResize.
   * Useful for fixed-height layouts.
   */
  fixed?: boolean;
  /** Additional class applied to the outer wrapper div */
  wrapperClassName?: string;
}

function setAutoHeight(el: HTMLTextAreaElement) {
  // Reset to 'auto' first so shrinking works correctly
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

/**
 * Accessible textarea with optional auto-resize behaviour (ResizeObserver).
 * Auto-wires ARIA attributes from FormFieldContext when present.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      validationState = 'default',
      autoResize = false,
      fixed = false,
      wrapperClassName,
      className,
      id: idProp,
      'aria-describedby': ariaDescribedByProp,
      'aria-invalid': ariaInvalidProp,
      'aria-required': ariaRequiredProp,
      disabled,
      readOnly,
      onChange,
      value,
      defaultValue,
      ...rest
    },
    forwardedRef,
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const textareaId = idProp ?? ctx?.inputId ?? generatedId;

    // Internal ref for auto-resize; merged with forwarded ref
    const internalRef = useRef<HTMLTextAreaElement>(null);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    // aria-describedby composition
    const describedByParts: string[] = [];
    if (ariaDescribedByProp) describedByParts.push(ariaDescribedByProp);
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    const ariaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    // aria-invalid
    const isInvalid =
      ariaInvalidProp !== undefined
        ? ariaInvalidProp
        : ctx?.invalid !== undefined
        ? ctx.invalid
        : validationState === 'error';

    // aria-required
    const isRequired =
      ariaRequiredProp !== undefined
        ? ariaRequiredProp
        : ctx?.required !== undefined
        ? ctx.required
        : rest.required;

    // Auto-resize: trigger on value change (controlled mode)
    useEffect(() => {
      if (!autoResize) return;
      const el = internalRef.current;
      if (!el) return;
      setAutoHeight(el);
    }, [value, autoResize]);

    // Auto-resize: trigger on defaultValue mount and ResizeObserver
    useEffect(() => {
      if (!autoResize) return;
      const el = internalRef.current;
      if (!el) return;

      // Initial sizing
      setAutoHeight(el);

      // Observe container resizes (e.g. window resize) and recompute height
      const observer = new ResizeObserver(() => {
        setAutoHeight(el);
      });
      observer.observe(el);

      return () => observer.disconnect();
    }, [autoResize]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) {
          setAutoHeight(e.currentTarget);
        }
        onChange?.(e);
      },
      [autoResize, onChange],
    );

    const textareaClasses = [
      styles.textarea,
      validationState === 'error' || isInvalid ? styles.textareaError : '',
      validationState === 'success' ? styles.textareaSuccess : '',
      autoResize ? styles.autoResize : '',
      fixed && !autoResize ? styles.fixed : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
        <textarea
          ref={setRef}
          id={textareaId}
          className={textareaClasses}
          aria-describedby={ariaDescribedBy}
          aria-invalid={isInvalid || undefined}
          aria-required={isRequired || undefined}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...rest}
        />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;