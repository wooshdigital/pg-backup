import React, { useId, useRef } from 'react';
import { useRadioGroup } from './RadioGroupContext';
import styles from './RadioGroup.module.css';

export interface RadioProps {
  /** Value of this radio option */
  value: string;
  /** Label text */
  label: React.ReactNode;
  /** Whether this specific radio is disabled (overrides group disabled) */
  disabled?: boolean;
  /** Whether this radio has an error */
  hasError?: boolean;
  /** Additional class name */
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  value,
  label,
  disabled: disabledProp,
  hasError = false,
  className,
}) => {
  const { name, value: groupValue, onChange, disabled: groupDisabled, focusedValue, onFocus } =
    useRadioGroup();
  const generatedId = useId();
  const id = `radio-${name}-${value}-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabledProp ?? groupDisabled ?? false;
  const isChecked = groupValue === value;
  // Roving tabindex: only the selected radio (or first if none selected) gets tabIndex=0
  // focusedValue tracks which is currently focused for roving tabindex
  const isTabStop = focusedValue === value;

  const wrapperClasses = [
    styles.radioWrapper,
    isDisabled ? styles.disabled : '',
    hasError ? styles.hasError : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleChange = () => {
    if (!isDisabled && onChange) {
      onChange(value);
      onFocus?.(value);
    }
  };

  const handleFocus = () => {
    onFocus?.(value);
  };

  return (
    <label htmlFor={id} className={wrapperClasses}>
      <input
        ref={inputRef}
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        onFocus={handleFocus}
        tabIndex={isTabStop ? 0 : -1}
        className={styles.radioInput}
        aria-invalid={hasError ? true : undefined}
      />
      <div className={styles.radioIndicator} aria-hidden="true" />
      <span className={styles.radioLabel}>{label}</span>
    </label>
  );
};

Radio.displayName = 'Radio';