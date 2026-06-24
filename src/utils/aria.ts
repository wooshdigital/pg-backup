// ─── Accessibility Utilities ──────────────────────────────────────────────────

/**
 * Generate accessible label for a monetary amount
 */
export function moneyAriaLabel(amount: string, currency: string): string {
  return `${amount} ${currency}`;
}

/**
 * Generate accessible label for a trip status
 */
export function tripStatusAriaLabel(status: string): string {
  return `Trip status: ${status}`;
}

/**
 * Build accessible hint for interactive elements
 */
export function buildAccessibilityHint(action: string, target: string): string {
  return `${action} ${target}`;
}