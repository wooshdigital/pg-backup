import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  KeyboardEvent,
} from 'react';
import { useRadioGroup } from './RadioGroupContext';
import styles from './RadioGroup.module.css';

export interface RadioProps {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ value, label, disabled: disabledProp, id: idProp, className }, forwardedRef) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    const {
      name,
      value: groupValue,
      defaultValue,
      onChange,
      disabled: groupDisabled,
      focusedValue,
      setFocusedValue,
    } = useRadioGroup();

    const disabled = disabledProp || groupDisabled;

    const internalRef = useRef<HTMLInputElement>(null);

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        (internalRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLInputElement | null>
          ).current = node;
        }
      },
      [forwardedRef]
    );

    // Determine checked state
    const isControlled = groupValue !== undefined;
    const checked = isControlled ? groupValue === value : undefined;
    const defaultChecked = !isControlled ? defaultValue === value : undefined;

    // Roving tabindex: tabIndex=0 if this is the focused/selected radio, else -1
    // If no value is focused yet, the first radio (or the first non-disabled) should be 0
    // We'll determine tabIndex as follows:
    // - If focusedValue is set, this radio gets 0 only if it matches
    // - If focusedValue is not set, we can't know if we're first, so default all to 0 initially
    //   and let the RadioGroup manage it (handled below)
    const tabIndex = focusedValue !== undefined
      ? focusedValue === value ? 0 : -1
      : 0; // Before any interaction, allow all to be focusable; RadioGroup sets initial

    const handleChange = useCallback(() => {
      if (disabled) return;
      onChange?.(value);
      setFocusedValue?.(value);
    }, [disabled, onChange, value, setFocusedValue]);

    const handleFocus = useCallback(() => {
      setFocusedValue?.(value);
    }, [value, setFocusedValue]);

    // Keyboard navigation: arrow keys move between radios
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        const isVertical = ['ArrowDown', 'ArrowUp'].includes(e.key);
        const isHorizontal = ['ArrowLeft', 'ArrowRight'].includes(e.key);
        if (!isVertical && !isHorizontal) return;

        e.preventDefault();

        // Find sibling radio inputs within the same radiogroup
        const radiogroup = e.currentTarget.closest('[role="radiogroup"]');
        if (!radiogroup) return;

        const allInputs = Array.from(
          radiogroup.querySelectorAll<HTMLInputElement>(
            `input[type="radio"][name="${name}"]`
          )
        ).filter((input) => !input.disabled);

        if (allInputs.length === 0) return;

        const currentIndex = allInputs.indexOf(e.currentTarget);
        let nextIndex: number;

        const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
        if (forward) {
          nextIndex = (currentIndex + 1) % allInputs.length;
        } else {
          nextIndex = (currentIndex - 1 + allInputs.length) % allInputs.length;
        }

        const nextInput = allInputs[nextIndex];
        nextInput.focus();
        nextInput.click();
      },
      [disabled, name]
    );

    const wrapperClass = [
      styles.radioWrapper,
      disabled ? styles.disabled : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label htmlFor={id} className={wrapperClass}>
        <input
          ref={setRef}
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          tabIndex={tabIndex}
          className={styles.input}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          aria-disabled={disabled ? true : undefined}
        />
        <span className={styles.indicator} aria-hidden="true" />
        <span className={styles.radioLabel}>{label}</span>
      </label>
    );
  }
);

Radio.displayName = 'Radio';