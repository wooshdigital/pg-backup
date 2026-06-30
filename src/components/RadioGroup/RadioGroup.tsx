import React, {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import styles from './RadioGroup.module.css';
import { classNames } from '../../utils/classNames';
import { RadioGroupContext } from './RadioGroupContext';

export interface RadioGroupProps {
  /** Group label rendered as a legend */
  legend: ReactNode;
  /** Shared name for all radio inputs */
  name?: string;
  /** Controlled value */
  value?: string;
  /** Default (uncontrolled) value */
  defaultValue?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Disables all radio inputs */
  disabled?: boolean;
  /** Required group */
  required?: boolean;
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Radio children */
  children: ReactNode;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  legend,
  name: nameProp,
  value: valueProp,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  orientation = 'vertical',
  helperText,
  error,
  children,
  className,
}) => {
  const generatedName = useId();
  const name = nameProp ?? generatedName;

  const groupId = useId();
  const legendId = `${groupId}-legend`;
  const helperTextId = helperText ? `${groupId}-helper` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;

  // Internal value state for uncontrolled usage
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : internalValue;

  // Collect radio values for arrow-key navigation
  const radioValuesRef = useRef<string[]>([]);

  // Roving tabindex state — track which radio should be focusable
  const [focusedValue, setFocusedValueState] = useState<string | undefined>(
    currentValue ?? defaultValue
  );

  const setFocusedValue = useCallback((value: string) => {
    setFocusedValueState(value);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      if (!isControlled) {
        setInternalValue(value);
      }
      setFocusedValue(value);
      onChange?.(value);
    },
    [isControlled, onChange, setFocusedValue]
  );

  // Gather radio values by inspecting children
  const radioValues = useMemo(() => {
    const values: string[] = [];
    const collectValues = (node: ReactNode) => {
      React.Children.forEach(node, (child) => {
        if (React.isValidElement(child)) {
          if (child.props.value !== undefined) {
            values.push(child.props.value as string);
          }
          if (child.props.children) {
            collectValues(child.props.children);
          }
        }
      });
    };
    collectValues(children);
    return values;
  }, [children]);

  radioValuesRef.current = radioValues;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const values = radioValuesRef.current;
      if (!values.length) return;

      const currentIndex = focusedValue ? values.indexOf(focusedValue) : -1;

      let nextIndex: number | undefined;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = currentIndex < values.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : values.length - 1;
      }

      if (nextIndex !== undefined) {
        const nextValue = values[nextIndex];
        setFocusedValue(nextValue);
        handleChange(nextValue);

        // Focus the input element for the next value
        // We find it in the DOM by name + value attributes
        const groupEl = e.currentTarget;
        const nextInput = groupEl.querySelector<HTMLInputElement>(
          `input[type="radio"][value="${CSS.escape(nextValue)}"]`
        );
        nextInput?.focus();
      }
    },
    [focusedValue, handleChange, setFocusedValue]
  );

  const contextValue = useMemo(
    () => ({
      name,
      value: currentValue,
      onChange: handleChange,
      disabled,
      focusedValue: focusedValue ?? radioValues[0],
      setFocusedValue,
    }),
    [name, currentValue, handleChange, disabled, focusedValue, radioValues, setFocusedValue]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <fieldset
        className={classNames(styles.fieldset, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[helperTextId, errorId].filter(Boolean).join(' ') || undefined}
        aria-required={required || undefined}
      >
        <legend id={legendId} className={classNames(styles.legend, required && styles.required)}>
          {legend}
        </legend>
        <div
          role="radiogroup"
          aria-labelledby={legendId}
          aria-orientation={orientation}
          className={classNames(styles.group, orientation === 'horizontal' && styles.horizontal)}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
        {helperText && !error && (
          <span id={helperTextId} className={styles.helperText}>
            {helperText}
          </span>
        )}
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = 'RadioGroup';