import React, { forwardRef } from 'react';
import { useSelectContext } from './SelectContext';
import styles from './Select.module.css';

export interface SelectOptionProps {
  value: string;
  label: string;
  disabled?: boolean;
  isActive?: boolean;
  isSelected?: boolean;
  optionId?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

const CheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    className={styles.optionCheck}
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export const SelectOption = forwardRef<HTMLLIElement, SelectOptionProps>(
  (
    {
      value,
      label,
      disabled = false,
      isActive = false,
      isSelected = false,
      optionId,
      onClick,
      onMouseEnter,
    },
    ref
  ) => {
    const classes = [
      styles.option,
      isActive ? styles.optionActive : '',
      isSelected ? styles.optionSelected : '',
      disabled ? styles.optionDisabled : '',
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!disabled && onClick) {
        onClick();
      }
    };

    const handleMouseEnter = () => {
      if (!disabled && onMouseEnter) {
        onMouseEnter();
      }
    };

    return (
      <li
        ref={ref}
        id={optionId}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled ? true : undefined}
        className={classes}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        // Prevent focus from moving to the option (keyboard nav handles focus)
        onMouseDown={(e) => e.preventDefault()}
      >
        <span
          className={[
            styles.optionCheck,
            isSelected ? '' : styles.optionCheckHidden,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          <CheckIcon />
        </span>
        <span>{label}</span>
      </li>
    );
  }
);

SelectOption.displayName = 'SelectOption';

export default SelectOption;