import React, { forwardRef, useContext, useId, useEffect, useRef, useCallback } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './Textarea.module.css';
import { classNames } from '../../utils/classNames';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual variant */
  variant?: 'default' | 'error' | 'success';
  /**
   * When true the textarea grows with its content up to maxHeight.
   * Uses ResizeObserver to detect content changes.
   */
  autoResize?: boolean;
  /** Minimum height in px when autoResize is enabled (default 80) */
  minHeight?: number;
  /** Maximum height in px when autoResize is enabled (default 400) */
  maxHeight?: number;
  /** Extra class name for the wrapper */
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant,
      autoResize = false,
      minHeight = 80,
      maxHeight = 400,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      id: idProp,
      style,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const ctx = useContext(FormFieldContext);
    const generatedId = useId();
    const id = idProp ?? ctx?.inputId ?? generatedId;

    // Build aria-describedby
    const describedByParts: string[] = [];
    if (ctx?.helperId) describedByParts.push(ctx.helperId);
    if (ctx?.errorId) describedByParts.push(ctx.errorId);
    if (ariaDescribedby) describedByParts.push(ariaDescribedby);
    const computedDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const isInvalid = ariaInvalid ?? (ctx?.hasError ? true : undefined);
    const isRequired = ariaRequired ?? ctx?.required ?? undefined;

    const resolvedVariant = variant ?? (ctx?.hasError ? 'error' : 'default');

    // Internal ref for resize logic – merged with forwarded ref
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref],
    );

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      // Reset height to shrink on delete
      el.style.height = 'auto';
      const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [autoResize, minHeight, maxHeight]);

    // Resize on mount
    useEffect(() => {
      if (autoResize) {
        resize();
      }
    }, [autoResize, resize]);

    // ResizeObserver to catch programmatic content changes
    useEffect(() => {
      if (!autoResize || !innerRef.current) return;
      const observer = new ResizeObserver(() => {
        // Only react to width changes (layout reflow) – height driven by us
        resize();
      });
      observer.observe(innerRef.current);
      return () => observer.disconnect();
    }, [autoResize, resize]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) resize();
        onChange?.(e);
      },
      [autoResize, onChange, resize],
    );

    const wrapperClass = classNames(
      styles.wrapper,
      styles[resolvedVariant] ?? undefined,
      wrapperClassName,
    );

    const textareaClass = classNames(
      styles.textarea,
      autoResize ? styles.autoResize : undefined,
      className,
    );

    const autoResizeStyle: React.CSSProperties = autoResize
      ? { minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px`, overflowY: 'hidden' }
      : {};

    return (
      <div className={wrapperClass}>
        <textarea
          ref={setRef}
          id={id}
          className={textareaClass}
          aria-describedby={computedDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          onChange={handleChange}
          style={{ ...autoResizeStyle, ...style }}
          {...rest}
        />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;