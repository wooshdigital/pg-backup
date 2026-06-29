import React, { forwardRef, useContext, useEffect, useId, useRef, useCallback } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning';
  /** Automatically resize height to fit content */
  autoResize?: boolean;
  /** Minimum number of rows (used as min-height when autoResize is true) */
  minRows?: number;
  /** Maximum number of rows (used as max-height when autoResize is true) */
  maxRows?: number;
  /** Element rendered before the textarea */
  prefix?: React.ReactNode;
  /** Element rendered after the textarea */
  suffix?: React.ReactNode;
  /** Additional CSS class for the wrapper */
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      validationState,
      autoResize = false,
      minRows = 3,
      maxRows,
      prefix,
      suffix,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      id: idProp,
      style,
      onChange,
      ...rest
    },
    ref
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const textareaId = idProp ?? ctx?.inputId ?? generatedId;

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Merge the forwarded ref with our internal ref
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

    // Compute CSS custom properties for min/max row heights
    const lineHeightPx = 24; // 1.5rem at 16px base
    const paddingVerticalPx = 16; // 0.5rem top + 0.5rem bottom
    const minHeightPx = minRows * lineHeightPx + paddingVerticalPx;
    const maxHeightPx = maxRows ? maxRows * lineHeightPx + paddingVerticalPx : undefined;

    const adjustHeight = useCallback(() => {
      const el = internalRef.current;
      if (!el || !autoResize) return;
      el.style.height = 'auto';
      const scrollH = el.scrollHeight;
      const clamped = maxHeightPx ? Math.min(scrollH, maxHeightPx) : scrollH;
      el.style.height = `${Math.max(minHeightPx, clamped)}px`;
      el.style.overflowY = maxHeightPx && scrollH > maxHeightPx ? 'auto' : 'hidden';
    }, [autoResize, minHeightPx, maxHeightPx]);

    // Initial height adjustment and on value changes
    useEffect(() => {
      adjustHeight();
    }, [adjustHeight, rest.value, rest.defaultValue]);

    // ResizeObserver to handle external container size changes
    useEffect(() => {
      if (!autoResize) return;
      const el = internalRef.current;
      if (!el) return;

      resizeObserverRef.current = new ResizeObserver(() => {
        adjustHeight();
      });
      resizeObserverRef.current.observe(el);

      return () => {
        resizeObserverRef.current?.disconnect();
      };
    }, [autoResize, adjustHeight]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight();
        onChange?.(e);
      },
      [adjustHeight, onChange]
    );

    // ARIA wiring
    const describedByParts: string[] = [];
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    if (ariaDescribedBy) describedByParts.push(ariaDescribedBy);
    const combinedDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const invalid =
      ariaInvalid !== undefined
        ? ariaInvalid
        : ctx?.hasError
        ? true
        : undefined;

    const required =
      ariaRequired !== undefined
        ? ariaRequired
        : ctx?.required
        ? true
        : undefined;

    const effectiveValidationState = validationState ?? (ctx?.hasError ? 'error' : undefined);

    const wrapperClasses = [
      styles.wrapper,
      effectiveValidationState === 'error' && styles.error,
      effectiveValidationState === 'success' && styles.success,
      effectiveValidationState === 'warning' && styles.warning,
      rest.disabled && styles.disabled,
      rest.readOnly && styles.readonly,
      autoResize && styles.autoResize,
      prefix && styles.hasPrefix,
      suffix && styles.hasSuffix,
      wrapperClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [styles.textarea, className].filter(Boolean).join(' ');

    const textareaStyle: React.CSSProperties = {
      ...style,
      ...(autoResize
        ? { minHeight: minHeightPx, overflowY: 'hidden', resize: 'none' }
        : undefined),
    };

    return (
      <div className={wrapperClasses}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <textarea
          ref={setRef}
          id={textareaId}
          className={textareaClasses}
          aria-describedby={combinedDescribedBy}
          aria-invalid={invalid}
          aria-required={required}
          onChange={handleChange}
          style={textareaStyle}
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

Textarea.displayName = 'Textarea';