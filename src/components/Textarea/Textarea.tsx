import React, { forwardRef, useContext, useEffect, useId, useRef, useCallback } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning';
  /** Automatically resize the textarea to fit its content */
  autoResize?: boolean;
  /** Minimum height in pixels when autoResize is enabled */
  minHeight?: number;
  /** Maximum height in pixels when autoResize is enabled (scrolls beyond this) */
  maxHeight?: number;
  /** Additional className for the wrapper */
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      validationState,
      autoResize = false,
      minHeight = 80,
      maxHeight,
      wrapperClassName,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      id: idProp,
      disabled,
      readOnly,
      onChange,
      style,
      ...rest
    },
    forwardedRef
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const textareaId = idProp ?? ctx?.inputId ?? generatedId;

    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Sync forwardedRef with internalRef
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    // Build aria-describedby from context + caller
    const describedByParts: string[] = [];
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy);
    const computedDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const isInvalid =
      ariaInvalid !== undefined
        ? ariaInvalid
        : ctx?.hasError ?? validationState === 'error'
        ? true
        : undefined;

    const isRequired = ariaRequired !== undefined ? ariaRequired : ctx?.required;

    const resolvedState = validationState ?? (ctx?.hasError ? 'error' : undefined);

    // Auto-resize logic
    const adjustHeight = useCallback(() => {
      const el = internalRef.current;
      if (!el || !autoResize) return;

      el.style.height = 'auto';
      const scrollH = el.scrollHeight;
      const clamped = maxHeight ? Math.min(scrollH, maxHeight) : scrollH;
      const final = Math.max(clamped, minHeight);
      el.style.height = `${final}px`;
      el.style.overflowY = maxHeight && scrollH > maxHeight ? 'auto' : 'hidden';
    }, [autoResize, minHeight, maxHeight]);

    // Adjust on mount
    useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [autoResize, adjustHeight]);

    // Observe resize (e.g. browser zoom, container changes)
    useEffect(() => {
      if (!autoResize) return;
      const el = internalRef.current;
      if (!el) return;

      const observer = new ResizeObserver(() => {
        adjustHeight();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [autoResize, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) adjustHeight();
      onChange?.(e);
    };

    const wrapperClasses = [
      styles.wrapper,
      resolvedState === 'error' && styles.error,
      resolvedState === 'success' && styles.success,
      resolvedState === 'warning' && styles.warning,
      disabled && styles.disabled,
      readOnly && styles.readonly,
      autoResize && styles.autoResize,
      wrapperClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [styles.textarea, className].filter(Boolean).join(' ');

    const computedStyle: React.CSSProperties = {
      ...(autoResize ? { minHeight, overflow: 'hidden' } : {}),
      ...(maxHeight && !autoResize ? { maxHeight, overflowY: 'auto' } : {}),
      ...style,
    };

    return (
      <div className={wrapperClasses}>
        <textarea
          ref={setRefs}
          id={textareaId}
          className={textareaClasses}
          disabled={disabled}
          readOnly={readOnly}
          aria-describedby={computedDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          onChange={handleChange}
          style={computedStyle}
          {...rest}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;