import type { AccessibilityRole, AccessibilityState } from 'react-native';

/**
 * Builds accessibility props for interactive elements.
 */
export function buildAccessibilityProps(options: {
  label: string;
  hint?: string;
  role?: AccessibilityRole;
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
}) {
  const { label, hint, role = 'button', disabled, selected, checked, expanded } = options;

  const accessibilityState: AccessibilityState = {};
  if (disabled !== undefined) accessibilityState.disabled = disabled;
  if (selected !== undefined) accessibilityState.selected = selected;
  if (checked !== undefined) accessibilityState.checked = checked;
  if (expanded !== undefined) accessibilityState.expanded = expanded;

  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState,
  };
}