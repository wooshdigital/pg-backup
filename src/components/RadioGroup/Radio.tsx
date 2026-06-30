import React, {
  forwardRef,
  useRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import styles from './RadioGroup.module.css';
import { classNames } from '../../utils/classNames';
import { useRadioGroup } from './RadioGroupContext';

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'name' | 'checked' | 'onChange'
  > {
  /** The value this radio represents */
  value: string;
  /** Label text */
  label: React.ReactNode;
  /** Error styling on the indicator */
  error?: boolean;
  /** Individual radio can be disabled (group disabled also applies) */
  disabled?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ value, label, error, disabled: itemDisabled, id, className, ...rest }, ref) => {
    const { name, value: groupValue, onChange, disabled: groupDisabled, focusedValue, setFocusedValue } =
      useRadioGroup();

    const disabled = itemDisabled || groupDisabled;
    const isChecked = groupValue === value;

    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    // Roving tabindex: only checked (or first) radio has tabIndex=0
    const tabIndex = focusedValue === value ? 0 : -1;

    const handleChange = () => {
      if (!disabled) {
        onChange?.(value);
        setFocusedValue?.(value);
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        // Navigation handled by RadioGroup
      }
    };

    return (
      <label
        className={classNames(styles.radioWrapper, disabled && styles.disabled, className)}
        htmlFor={inputId}
      >
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          tabIndex={tabIndex}
          className={styles.radioInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <div
          className={classNames(styles.radioIndicator, error && styles.hasError)}
          aria-hidden="true"
        />
        <span className={styles.radioLabel}>{label}</span>
      </label>
    );
  }
);

Radio.displayName = 'Radio';