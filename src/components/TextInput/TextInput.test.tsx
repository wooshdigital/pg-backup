import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

// Helper to wrap with FormFieldContext
function renderWithFieldCtx(
  ui: React.ReactElement,
  ctx: Partial<React.ContextType<typeof FormFieldContext>> = {}
) {
  const defaultCtx = {
    inputId: 'test-input',
    helperId: undefined,
    errorId: undefined,
    hasError: false,
    required: false,
    ...ctx,
  };
  return render(
    <FormFieldContext.Provider value={defaultCtx}>
      {ui}
    </FormFieldContext.Provider>
  );
}

describe('TextInput', () => {
  it('renders an input element', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('passes through placeholder and value', () => {
    render(<TextInput placeholder="Search..." defaultValue="hello" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.placeholder).toBe('Search...');
    expect(input.value).toBe('hello');
  });

  it('works in controlled mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <TextInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          aria-label="controlled"
        />
      );
    }

    render(<Controlled />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'abc');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect((input as HTMLInputElement).value).toBe('abc');
  });

  it('works in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(<TextInput defaultValue="" aria-label="uncontrolled" />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect((input as HTMLInputElement).value).toBe('hello');
  });

  it('wires aria-describedby from FormFieldContext', () => {
    renderWithFieldCtx(<TextInput aria-label="field" />, {
      helperId: 'helper-1',
      errorId: 'error-1',
    });
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'helper-1 error-1');
  });

  it('merges aria-describedby from context and prop', () => {
    renderWithFieldCtx(
      <TextInput aria-label="field" aria-describedby="extra-id" />,
      {
        helperId: 'helper-1',
      }
    );
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-describedby')).toContain('helper-1');
    expect(input.getAttribute('aria-describedby')).toContain('extra-id');
  });

  it('sets aria-invalid from context hasError', () => {
    renderWithFieldCtx(<TextInput aria-label="field" />, { hasError: true });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required from context required', () => {
    renderWithFieldCtx(<TextInput aria-label="field" />, { required: true });
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true'
    );
  });

  it('prop aria-invalid overrides context', () => {
    renderWithFieldCtx(
      <TextInput aria-label="field" aria-invalid={false} />,
      { hasError: true }
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-invalid',
      'false'
    );
  });

  it('is disabled when disabled prop is set', () => {
    render(<TextInput aria-label="field" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders prefix and suffix', () => {
    render(
      <TextInput
        aria-label="search"
        prefix={<span data-testid="prefix-icon">$</span>}
        suffix={<span data-testid="suffix-icon">✓</span>}
      />
    );
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="ai-input">Name</label>
        <TextInput id="ai-input" placeholder="Enter name" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('CharacterCount', () => {
  it('renders remaining characters', () => {
    render(<CharacterCount current={20} max={100} />);
    expect(screen.getByText(/80 of 100 remaining/i)).toBeInTheDocument();
  });

  it('shows over-limit text when exceeded', () => {
    render(<CharacterCount current={105} max={100} />);
    expect(screen.getByText(/5 over limit/i)).toBeInTheDocument();
  });

  it('has an aria-live polite region', () => {
    render(<CharacterCount current={50} max={100} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('announces remaining count', () => {
    render(<CharacterCount current={30} max={100} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/70 of 100 characters remaining/i);
  });

  it('announces over-limit to screen readers', () => {
    render(<CharacterCount current={110} max={100} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/10 characters over the limit/i);
  });

  it('updates aria-live region when count changes', () => {
    const { rerender } = render(<CharacterCount current={10} max={100} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/90 of 100 characters remaining/i);

    rerender(<CharacterCount current={50} max={100} />);
    expect(liveRegion?.textContent).toMatch(/50 of 100 characters remaining/i);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CharacterCount current={20} max={100} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('TextInput + CharacterCount integration', () => {
  it('updates character count as user types', async () => {
    const user = userEvent.setup();

    function WithCount() {
      const [value, setValue] = useState('');
      return (
        <div>
          <TextInput
            aria-label="bio"
            maxLength={50}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <CharacterCount current={value.length} max={50} />
        </div>
      );
    }

    render(<WithCount />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    expect(screen.getByText(/45 of 50 remaining/i)).toBeInTheDocument();
  });
});