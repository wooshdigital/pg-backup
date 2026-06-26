import React from 'react';
import styles from './CharacterCount.module.css';

export interface CharacterCountProps {
  /** Current length of the input value */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /**
   * Fraction of max at which the count turns "warning" colour.
   * Defaults to 0.8 (80 %).
   */
  warningThreshold?: number;
  /** Extra class name */
  className?: string;
  /** ID so the input can reference this via aria-describedby */
  id?: string;
}

/**
 * Renders an aria-live="polite" region that announces remaining characters
 * as the user types.
 */
export const CharacterCount: React.FC<CharacterCountProps> = ({
  current,
  max,
  warningThreshold = 0.8,
  className,
  id,
}) => {
  const remaining = max - current;
  const ratio = current / max;

  let colorClass = '';
  if (remaining < 0) {
    colorClass = styles.error;
  } else if (ratio >= warningThreshold) {
    colorClass = styles.warning;
  }

  return (
    <span
      id={id}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[styles.characterCount, colorClass, className].filter(Boolean).join(' ')}
    >
      {remaining < 0
        ? `${Math.abs(remaining)} characters over limit`
        : `${remaining} of ${max} characters remaining`}
    </span>
  );
};

export default CharacterCount;