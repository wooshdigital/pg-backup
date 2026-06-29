import React, { forwardRef, useContext, useEffect, useId, useRef, useCallback } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning';
  /** Automatically grow textarea to fit content */
  autoResize?: boolean;
  /** Minimum number of visible rows */
  minRows?: number;
  /** Maximum number of visible rows (only meaningful with autoResize) */
  maxRows?: number;
  /** Full width */
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      validationState,
      autoResize = false,
      minRows = 3,
      maxRows,
      fullWidth = false,
      className,
      id: idProp,
      'aria-describedby': ariaDescribedByProp,
      'aria-invalid': ariaInvalidProp,
      'aria-required': ariaRequiredProp,
      disabled,
      style,
      onChange,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldCtx = useContext(FormFieldContext);
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

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

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

    const adjustHeight = useCallback(() => {
      const el = internalRef.current;
      if (!el || !autoResize) return;

      // Reset height to auto to get the real scrollHeight
      el.style.height = 'auto';

      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
      const paddingTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const paddingBottom = parseFloat(getComputedStyle(el).paddingBottom) || 0;
      const extraPadding = paddingTop + paddingBottom;

      const minHeight = minRows * lineHeight + extraPadding;
      const maxHeight = maxRows ? maxRows * lineHeight + extraPadding : Infinity;
      const newHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);

      el.style.height = `${newHeight}px`;
      el.style.overflowY = maxRows && el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [autoResize, minRows, maxRows]);

    // Adjust on mount and when content changes
    useEffect(() => {
      adjustHeight();
    }, [adjustHeight, rest.value, rest.defaultValue]);

    // Use ResizeObserver to detect external size changes
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

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight();
        onChange?.(e);
      },
      [adjustHeight, onChange]
    );

    const wrapperClasses = [
      styles.wrapper,
      fullWidth ? styles.fullWidth : '',
      disabled ? styles.disabled : '',
      validationState === 'error' || fieldCtx?.hasError ? styles.error : '',
      validationState === 'success' ? styles.success : '',
      validationState === 'warning' ? styles.warning : '',
      autoResize ? styles.autoResize : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaStyle: React.CSSProperties = {
      ...style,
      ...(minRows ? { minHeight: `calc(${minRows} * 1.5em + 1rem)` } : {}),
      ...(maxRows && !autoResize ? { maxHeight: `calc(${maxRows} * 1.5em + 1rem)` } : {}),
    };

    return (
      <div className={wrapperClasses}>
        <textarea
          {...rest}
          ref={setRef}
          id={id}
          disabled={disabled}
          rows={minRows}
          className={styles.textarea}
          style={textareaStyle}
          aria-describedby={ariaDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          onChange={handleChange}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;