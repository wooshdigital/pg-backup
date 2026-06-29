import React from 'react';
import styles from './CharacterCount.module.css';
import { classNames } from '../../utils/classNames';

export interface CharacterCountProps {
  /** Current number of characters */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** Additional class name */
  className?: string;
  /**
   * Fraction of max at which the count turns "warning" colour.
   * Defaults to 0.8 (80 %).
   */
  warningThreshold?: number;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({
  current,
  max,
  className,
  warningThreshold = 0.8,
}) => {
  const remaining = max - current;
  const ratio = current / max;
  const isWarning = ratio >= warningThreshold && ratio < 1;
  const isError = remaining < 0;

  const countClass = classNames(
    styles.count,
    isWarning ? styles.warning : undefined,
    isError ? styles.error : undefined,
    className,
  );

  // Human-friendly announcement
  const label =
    remaining >= 0
      ? `${remaining} of ${max} characters remaining`
      : `${Math.abs(remaining)} characters over limit`;

  return (
    <span
      className={countClass}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <span className={styles.visualLabel}>{label}</span>
      {/* Numeric summary visible to sighted users */}
      <span aria-hidden="true" className={styles.numeric}>
        {current}/{max}
      </span>
    </span>
  );
};

CharacterCount.displayName = 'CharacterCount';

export default CharacterCount;