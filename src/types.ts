import type { AriaAttributes, HTMLAttributes, ReactNode } from 'react';

/**
 * Validation states for form fields
 */
export type ValidationState = 'valid' | 'invalid' | 'warning' | 'none';

/**
 * Common size variants
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Common visual variants
 */
export type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'ghost';

/**
 * Base ARIA props that can be applied to any element
 */
export interface AriaProps extends AriaAttributes {
  /** Identifies the element that labels the current element */
  'aria-labelledby'?: string;
  /** Defines a string value that labels the current element */
  'aria-label'?: string;
  /** Identifies the element(s) that describe the current element */
  'aria-describedby'?: string;
  /** Indicates that the element has a popup */
  'aria-haspopup'?: AriaAttributes['aria-haspopup'];
  /** Indicates whether the element is currently expanded or collapsed */
  'aria-expanded'?: boolean;
  /** Indicates the current disabled state of the element */
  'aria-disabled'?: boolean;
  /** Indicates that the element is perceivable but disabled */
  'aria-hidden'?: boolean;
  /** Indicates that user input is required before form submission */
  'aria-required'?: boolean;
  /** Indicates the entered value does not conform to the expected format */
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  /** Identifies the element(s) whose contents/presence is controlled by the current element */
  'aria-controls'?: string;
  /** Identifies the currently active element when focus is on a composite widget */
  'aria-activedescendant'?: string;
  /** Defines a live region and indicates the types of updates the user agents/AT will present */
  'aria-live'?: 'assertive' | 'polite' | 'off';
  /** Indicates that the element is selected */
  'aria-selected'?: boolean;
  /** Defines the current item within a container */
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  /** Indicates whether element can be pressed */
  'aria-pressed'?: boolean | 'mixed';
  /** Defines the total number of items in a set */
  'aria-setsize'?: number;
  /** Defines the element's number in the current set */
  'aria-posinset'?: number;
  /** Defines the number of items in the current set of list items */
  'aria-level'?: number;
  /** Defines a short hint intended to aid the user with data entry */
  'aria-placeholder'?: string;
}

/**
 * Props for focusable elements
 */
export interface FocusableProps {
  /** Whether the element should receive focus on mount */
  autoFocus?: boolean;
  /** Tab index for focus management */
  tabIndex?: number;
  /** Callback fired when element receives focus */
  onFocus?: HTMLAttributes<HTMLElement>['onFocus'];
  /** Callback fired when element loses focus */
  onBlur?: HTMLAttributes<HTMLElement>['onBlur'];
  /** Callback fired when focus becomes visible (keyboard navigation) */
  onFocusVisible?: () => void;
}

/**
 * Base props for form field components
 */
export interface FormFieldProps extends AriaProps, FocusableProps {
  /** Unique identifier for the field */
  id?: string;
  /** Field name for form submission */
  name?: string;
  /** Human-readable label for the field */
  label?: string;
  /** Helper text displayed below the field */
  helperText?: ReactNode;
  /** Error message displayed when validation fails */
  errorMessage?: ReactNode;
  /** Warning message displayed for non-critical issues */
  warningMessage?: ReactNode;
  /** Current validation state of the field */
  validationState?: ValidationState;
  /** Whether the field is required */
  isRequired?: boolean;
  /** Whether the field is disabled */
  isDisabled?: boolean;
  /** Whether the field is read-only */
  isReadOnly?: boolean;
  /** Whether the label should be hidden (still accessible to screen readers) */
  isLabelHidden?: boolean;
  /** Additional class name(s) to apply */
  className?: string;
}

/**
 * Helper type for polymorphic components
 */
export type PolymorphicProps<E extends React.ElementType, P = {}> = P &
  Omit<React.ComponentPropsWithRef<E>, keyof P> & {
    as?: E;
  };

/**
 * ID generation options
 */
export interface UseIdOptions {
  /** Prefix to prepend to the generated ID */
  prefix?: string;
  /** Static ID to use instead of generating one */
  id?: string;
}

/**
 * Focus visibility state
 */
export interface FocusVisibleState {
  /** Whether focus is currently visible (keyboard-driven) */
  isFocusVisible: boolean;
  /** Props to spread onto the element */
  focusProps: {
    onFocus: (e: React.FocusEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
  };
}

/**
 * ARIA live region politeness settings
 */
export type AriaLivePoliteness = 'assertive' | 'polite' | 'off';

/**
 * Direction for navigation
 */
export type NavigationDirection = 'next' | 'prev' | 'first' | 'last';