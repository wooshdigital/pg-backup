import React, { useCallback } from 'react';
import { useSelectContext } from './SelectContext';
import type { SelectOption as SelectOptionType } from './SelectContext';
import styles from './Select.module.css';
import { classNames } from '../../utils/classNames';

interface SelectOptionProps {
  id: string;
  option: SelectOptionType;
  isSelected: boolean;
  isActive: boolean;
  index: number;
  onSetActiveIndex: (index: number) => void;
}

export function SelectOption({
  id,
  option,
  isSelected,
  isActive,
  index,
  onSetActiveIndex,
}: SelectOptionProps) {
  const { onSelect } = useSelectContext();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!option.disabled) {
        onSelect(option.value);
        onSetActiveIndex(index);
      }
    },
    [option, onSelect, onSetActiveIndex, index]
  );

  const handleMouseEnter = useCallback(() => {
    if (!option.disabled) {
      onSetActiveIndex(index);
    }
  }, [option.disabled, onSetActiveIndex, index]);

  return (
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled ? true : undefined}
      className={classNames(
        styles.option,
        isActive && styles.optionActive,
        isSelected && styles.optionSelected,
        option.disabled && styles.optionDisabled
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <span className={styles.optionLabel}>{option.label}</span>
      {isSelected && (
        <span className={styles.optionCheck} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 7L5.5 10L11.5 4"
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