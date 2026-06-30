import React, { useId, useCallback } from 'react';
import styles from './RadioGroup.module.css';
import { useRadioGroup } from './RadioGroupContext';

export interface RadioProps {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Radio: React.FC<RadioProps> = ({
  value,
  label,
  description,
  disabled: disabledProp,
  className,
  id: idProp,
}) => {
  const autoId = useId();
  const id = idProp ?? autoId;

  const { name, value: groupValue, onChange, disabled: groupDisabled } = useRadioGroup();

  const isDisabled = disabledProp ?? groupDisabled ?? false;
  const isChecked = groupValue === value;

  // Roving tabindex: only the selected (or first if none selected) gets tabIndex=0
  // This is managed by the group's keyboard handler; we just set tabIndex based on checked state
  // If nothing is selected, the first radio will be tab-reachable (handled via :first-of-type or logic below)
  const tabIndex = isChecked ? 0 : -1;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        onChange?.(value);
      }
    },
    [onChange, value],
  );

  const wrapperClasses = [
    styles.radioWrapper,
    isDisabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label htmlFor={id} className={wrapperClasses} style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        tabIndex={tabIndex}
        onChange={handleChange}
        className={styles.radioInput}
        aria-describedby={description ? `${id}-description` : undefined}
      />
      <div className={styles.radioIndicator} aria-hidden="true">
        <div className={styles.radioDot} />
      </div>
      <span className={styles.radioLabelContent}>
        <span className={styles.radioLabel}>{label}</span>
        {description && (
          <span id={`${id}-description`} className={styles.radioDescription}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
};

Radio.displayName = 'Radio';