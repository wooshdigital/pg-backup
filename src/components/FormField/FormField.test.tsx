import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormField } from './FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { useFormField } from './useFormField';

expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// Helper fixtures
// ---------------------------------------------------------------------------

const BasicField: React.FC<{
  hasError?: boolean;
  required?: boolean;
  disabled?: boolean;
}> = ({ hasError = false, required = false, disabled = false }) => (
  <FormField
    id="test-field"
    hasError={hasError}
    required={required}
    disabled={disabled}
  >
    <Label>Email address</Label>
    <input
      id="test-field"
      type="email"
      aria-labelledby="test-field-label"
      aria-describedby={hasError ? 'test-field-error' : 'test-field-helper'}
      aria-invalid={hasError || undefined}
      aria-required={required || undefined}
      aria-disabled={disabled || undefined}
    />
    <HelperText>We'll never share your email.</HelperText>
    <ErrorMessage>Please enter a valid email address.</ErrorMessage>
  </FormField>
);

// ---------------------------------------------------------------------------
// axe-core accessibility tests
// ---------------------------------------------------------------------------

describe('FormField – axe-core accessibility', () => {
  it('has no violations in default (no error) state', async () => {
    const { container } = render(<BasicField />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(<BasicField hasError />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = render(<BasicField required />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<BasicField disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// ID namespacing & ARIA wiring
// ---------------------------------------------------------------------------

describe('FormField – ID namespacing', () => {
  it('generates stable namespaced IDs from the provided id prop', () => {
    render(<BasicField />);
    expect(document.getElementById('test-field-label')).not.toBeNull();
    expect(document.getElementById('test-field-helper')).not.toBeNull();
  });

  it('generates unique IDs when no id prop is provided', () => {
    const { unmount } = render(
      <FormField>
        <Label>First</Label>
        <input id="dummy1" />
      </FormField>
    );
    const { unmount: unmount2 } = render(
      <FormField>
        <Label>Second</Label>
        <input id="dummy2" />
      </FormField>
    );

    const labels = document.querySelectorAll('label');
    const ids = Array.from(labels).map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length); // all unique

    unmount();
    unmount2();
  });
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

describe('Label', () => {
  it('renders with the correct htmlFor pointing to fieldId', () => {
    render(<BasicField />);
    const label = screen.getByText('Email address').closest('label');
    expect(label).toHaveAttribute('for', 'test-field');
  });

  it('renders required asterisk when required=true', () => {
    render(<BasicField required />);
    // The asterisk is aria-hidden so query the DOM directly
    const asterisk = document.querySelector('[aria-hidden="true"][title="Required"]');
    expect(asterisk).not.toBeNull();
  });

  it('does not render required asterisk when required=false', () => {
    render(<BasicField />);
    const asterisk = document.querySelector('[title="Required"]');
    expect(asterisk).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// HelperText
// ---------------------------------------------------------------------------

describe('HelperText', () => {
  it('renders with role="note" when there is no error', () => {
    render(<BasicField />);
    const helper = screen.getByRole('note');
    expect(helper).toBeInTheDocument();
    expect(helper).toHaveTextContent("We'll never share your email.");
  });

  it('has a stable id matching helperId', () => {
    render(<BasicField />);
    expect(document.getElementById('test-field-helper')).not.toBeNull();
  });

  it('is hidden when hasError=true', () => {
    render(<BasicField hasError />);
    const notes = document.querySelectorAll('[role="note"]');
    expect(notes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// ErrorMessage
// ---------------------------------------------------------------------------

describe('ErrorMessage', () => {
  it('is not rendered when hasError=false', () => {
    render(<BasicField />);
    const alerts = document.querySelectorAll('[role="alert"]');
    expect(alerts).toHaveLength(0);
  });

  it('renders with role="alert" and aria-live="polite" when hasError=true', () => {
    render(<BasicField hasError />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders error message text', () => {
    render(<BasicField hasError />);
    expect(
      screen.getByText('Please enter a valid email address.')
    ).toBeInTheDocument();
  });

  it('has a stable id matching errorId', () => {
    render(<BasicField hasError />);
    expect(document.getElementById('test-field-error')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// useFormField hook
// ---------------------------------------------------------------------------

describe('useFormField', () => {
  it('throws when used outside a FormField', () => {
    const BrokenComponent: React.FC = () => {
      useFormField();
      return null;
    };

    // Suppress the console.error from React's error boundary
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BrokenComponent />)).toThrow(
      /useFormField\(\) must be used within a <FormField>/
    );
    spy.mockRestore();
  });

  it('returns correct context values inside a FormField', () => {
    let captured: ReturnType<typeof useFormField> | null = null;

    const Consumer: React.FC = () => {
      captured = useFormField();
      return null;
    };

    render(
      <FormField id="ctx-test" hasError required disabled>
        <Consumer />
      </FormField>
    );

    expect(captured).not.toBeNull();
    expect(captured!.fieldId).toBe('ctx-test');
    expect(captured!.labelId).toBe('ctx-test-label');
    expect(captured!.helperId).toBe('ctx-test-helper');
    expect(captured!.errorId).toBe('ctx-test-error');
    expect(captured!.hasError).toBe(true);
    expect(captured!.required).toBe(true);
    expect(captured!.disabled).toBe(true);
  });
});