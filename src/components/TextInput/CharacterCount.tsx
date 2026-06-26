import React from 'react';
import styles from './CharacterCount.module.css';

export interface CharacterCountProps {
  /** Current character count */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** ID for external aria-describedby wiring */
  id?: string;
  /** Class name override */
  className?: string;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({ current, max, id, className }) => {
  const remaining = max - current;
  const percentage = max > 0 ? current / max : 0;

  const thresholdClass =
    percentage >= 1
      ? styles.exceeded
      : percentage >= 0.9
      ? styles.critical
      : percentage >= 0.75
      ? styles.warning
      : styles.normal;

  const classes = [styles.count, thresholdClass, className].filter(Boolean).join(' ');

  // Accessible message for screen readers
  const srMessage =
    remaining < 0
      ? `${Math.abs(remaining)} characters over the limit of ${max}`
      : `${remaining} of ${max} characters remaining`;

  return (
    <span
      id={id}
      className={classes}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {/* Visible numeric display */}
      <span aria-hidden="true">
        {current}/{max}
      </span>
      {/* Screen reader only text */}
      <span className={styles.srOnly}>{srMessage}</span>
    </span>
  );
};

CharacterCount.displayName = 'CharacterCount';

export default CharacterCount;