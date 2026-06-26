import React, { forwardRef, useCallback, useContext, useEffect, useId, useRef } from 'react';
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
  /** Additional className for the wrapper div */
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      validationState,
      autoResize = false,
      minHeight = 80,
      maxHeight,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      disabled,
      required,
      id: idProp,
      style,
      onChange,
      ...rest
    },
    forwardedRef
  ) => {
    const fallbackId = useId();
    const fieldCtx = useContext(FormFieldContext);
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const id = idProp ?? fieldCtx?.inputId ?? fallbackId;

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

    // Auto-resize logic
    const syncHeight = useCallback(
      (el: HTMLTextAreaElement) => {
        if (!autoResize) return;
        el.style.height = 'auto';
        const scrollHeight = el.scrollHeight;
        const newHeight = maxHeight ? Math.min(scrollHeight, maxHeight) : scrollHeight;
        el.style.height = `${Math.max(newHeight, minHeight)}px`;
        el.style.overflowY = maxHeight && scrollHeight > maxHeight ? 'auto' : 'hidden';
      },
      [autoResize, minHeight, maxHeight]
    );

    // Assign both the forwarded ref and our internal ref
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    // Set up ResizeObserver to sync height when content changes externally
    useEffect(() => {
      if (!autoResize || !internalRef.current) return;

      const el = internalRef.current;
      syncHeight(el);

      resizeObserverRef.current = new ResizeObserver(() => {
        syncHeight(el);
      });
      resizeObserverRef.current.observe(el);

      return () => {
        resizeObserverRef.current?.disconnect();
      };
    }, [autoResize, syncHeight]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) syncHeight(e.target);
        onChange?.(e);
      },
      [autoResize, syncHeight, onChange]
    );

    const wrapperClasses = [
      styles.wrapper,
      validationState === 'error' || fieldCtx?.hasError ? styles.stateError : '',
      validationState === 'success' ? styles.stateSuccess : '',
      validationState === 'warning' ? styles.stateWarning : '',
      disabled ? styles.disabled : '',
      autoResize ? styles.autoResize : '',
      wrapperClassName ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [styles.textarea, className ?? ''].filter(Boolean).join(' ');

    const computedStyle: React.CSSProperties = {
      ...(autoResize ? { minHeight, ...(maxHeight ? { maxHeight } : {}), overflowY: 'hidden' } : {}),
      ...style,
    };

    return (
      <div className={wrapperClasses}>
        <textarea
          ref={setRef}
          id={id}
          className={textareaClasses}
          disabled={disabled}
          required={required}
          aria-describedby={mergedDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          style={computedStyle}
          onChange={handleChange}
          {...rest}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;