import React, {
  forwardRef,
  useContext,
  useId,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './Textarea.module.css';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual validation state */
  validationState?: 'error' | 'success' | 'warning' | 'none';
  /**
   * When true, the textarea grows to fit content height automatically.
   * Uses ResizeObserver to respond to content changes.
   */
  autoResize?: boolean;
  /** Minimum number of visible text rows (used as min-height) */
  minRows?: number;
  /** Maximum number of visible text rows before scrolling */
  maxRows?: number;
  /** Wrapper class name */
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      validationState,
      autoResize = false,
      minRows = 3,
      maxRows,
      wrapperClassName,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      disabled,
      id: idProp,
      onChange,
      style,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldCtx = useContext(FormFieldContext);
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Support both forwarded ref and internal ref
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

    const inputId = idProp ?? fieldCtx?.inputId ?? generatedId;

    // Merge aria-describedby
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

    // Auto-resize logic
    const adjustHeight = useCallback(() => {
      const el = internalRef.current;
      if (!el || !autoResize) return;

      // Reset height to measure scrollHeight correctly
      el.style.height = 'auto';

      const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20;
      const paddingTop =
        parseInt(getComputedStyle(el).paddingTop) || 0;
      const paddingBottom =
        parseInt(getComputedStyle(el).paddingBottom) || 0;
      const extraPadding = paddingTop + paddingBottom;

      const minHeight = minRows * lineHeight + extraPadding;
      const maxHeight = maxRows
        ? maxRows * lineHeight + extraPadding
        : undefined;

      const scrollHeight = el.scrollHeight;
      const newHeight = Math.max(scrollHeight, minHeight);

      if (maxHeight !== undefined && newHeight > maxHeight) {
        el.style.height = `${maxHeight}px`;
        el.style.overflowY = 'auto';
      } else {
        el.style.height = `${newHeight}px`;
        el.style.overflowY = 'hidden';
      }
    }, [autoResize, minRows, maxRows]);

    // Set up ResizeObserver for autoResize
    useEffect(() => {
      if (!autoResize) return;

      const el = internalRef.current;
      if (!el) return;

      adjustHeight();

      const observer = new ResizeObserver(() => {
        adjustHeight();
      });

      observer.observe(el);

      return () => {
        observer.disconnect();
      };
    }, [autoResize, adjustHeight]);

    // Also adjust on value changes (controlled mode)
    useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [rest.value, autoResize, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        adjustHeight();
      }
      onChange?.(e);
    };

    const wrapperClasses = [
      styles.wrapper,
      resolvedValidationState !== 'none'
        ? styles[`wrapper--${resolvedValidationState}`]
        : '',
      disabled ? styles['wrapper--disabled'] : '',
      autoResize ? styles['wrapper--auto-resize'] : '',
      wrapperClassName ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [
      styles.textarea,
      autoResize ? styles['textarea--auto-resize'] : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        <textarea
          ref={setRef}
          id={inputId}
          className={textareaClasses}
          disabled={disabled}
          aria-describedby={mergedDescribedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          rows={autoResize ? undefined : minRows}
          onChange={handleChange}
          style={style}
          {...rest}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;