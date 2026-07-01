import React, { useCallback } from 'react';
import { useSelectContext } from './SelectContext';
import type { SelectOption as SelectOptionType } from './SelectContext';
import styles from './Select.module.css';
import { classNames } from '../../utils/classNames';

export interface SelectOptionProps {
  option: SelectOptionType;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onSetActiveIndex: (index: number) => void;
}

export function SelectOption({
  option,
  index,
  isActive,
  isSelected,
  onSetActiveIndex,
}: SelectOptionProps) {
  const { selectOption, getOptionId } = useSelectContext();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!option.disabled) {
        selectOption(option.value);
      }
    },
    [option, selectOption]
  );

  const handleMouseMove = useCallback(() => {
    if (!option.disabled) {
      onSetActiveIndex(index);
    }
  }, [option.disabled, onSetActiveIndex, index]);

  return (
    <div
      id={getOptionId(option.value)}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled ? 'true' : undefined}
      className={classNames(
        styles.option,
        isActive && styles.optionActive,
        isSelected && styles.optionSelected,
        option.disabled && styles.optionDisabled
      )}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      <span className={styles.optionLabel}>{option.label}</span>
      {isSelected && (
        <span className={styles.optionCheck} aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 7L5.5 10.5L12 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

export default SelectOption;