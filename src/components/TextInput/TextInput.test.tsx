import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

describe('TextInput', () => {
  it('renders a native input element', () => {
    render(<TextInput aria-label="Test" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards all standard HTML input attributes', () => {
    render(
      <TextInput
        aria-label="Test"
        type="email"
        placeholder="Enter email"
        data-testid="my-input"
        maxLength={50}
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
    expect(input).toHaveAttribute('maxlength', '50');
  });

  it('uses provided id', () => {
    render(<TextInput id="custom-id" aria-label="Test" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
  });

  it('picks up inputId from FormFieldContext', () => {
    render(
      <FormFieldContext.Provider
        value={{ inputId: 'ctx-id', helperId: undefined, errorId: undefined, required: false, invalid: false }}
      >
        <TextInput aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'ctx-id');
  });

  it('wires aria-describedby from context helpers', () => {
    render(
      <FormFieldContext.Provider
        value={{
          inputId: 'i',
          helperId: 'help-1',
          errorId: 'err-1',
          required: false,
          invalid: false,
        }}
      >
        <TextInput aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'help-1 err-1');
  });

  it('merges explicit aria-describedby with context helpers', () => {
    render(
      <FormFieldContext.Provider
        value={{
          inputId: 'i',
          helperId: 'help-1',
          errorId: undefined,
          required: false,
          invalid: false,
        }}
      >
        <TextInput aria-label="Test" aria-describedby="extra" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'extra help-1');
  });

  it('sets aria-invalid from validationState=error', () => {
    render(<TextInput aria-label="Test" validationState="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid from context invalid flag', () => {
    render(
      <FormFieldContext.Provider
        value={{ inputId: 'i', helperId: undefined, errorId: undefined, required: false, invalid: true }}
      >
        <TextInput aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid for default state', () => {
    render(<TextInput aria-label="Test" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('sets aria-required from context', () => {
    render(
      <FormFieldContext.Provider
        value={{ inputId: 'i', helperId: undefined, errorId: undefined, required: true, invalid: false }}
      >
        <TextInput aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('renders prefix slot', () => {
    render(<TextInput aria-label="Test" prefix={<span data-testid="pfx">$</span>} />);
    expect(screen.getByTestId('pfx')).toBeInTheDocument();
  });

  it('renders suffix slot', () => {
    render(<TextInput aria-label="Test" suffix={<span data-testid="sfx">✓</span>} />);
    expect(screen.getByTestId('sfx')).toBeInTheDocument();
  });

  it('prefix/suffix are aria-hidden', () => {
    render(
      <TextInput
        aria-label="Test"
        prefix={<span>$</span>}
        suffix={<span>✓</span>}
      />,
    );
    // The wrapper spans should be aria-hidden
    const hiddenSpans = document.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenSpans.length).toBeGreaterThanOrEqual(2);
  });

  it('works as a controlled input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <TextInput
          aria-label="Test"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleChange(e.target.value);
          }}
        />
      );
    }

    render(<Controlled />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(handleChange).toHaveBeenCalledTimes(5);
    expect(input).toHaveValue('hello');
  });

  it('works as an uncontrolled input', async () => {
    const user = userEvent.setup();
    render(<TextInput aria-label="Test" defaultValue="initial" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial');
    await user.clear(input);
    await user.type(input, 'new');
    expect(input).toHaveValue('new');
  });

  it('is disabled when disabled prop is set', () => {
    render(<TextInput aria-label="Test" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is readonly when readOnly prop is set', () => {
    render(<TextInput aria-label="Test" readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('forwards inputMode attribute', () => {
    render(<TextInput aria-label="Test" inputMode="numeric" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="ax-input">Name</label>
        <TextInput id="ax-input" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('CharacterCount', () => {
  it('renders remaining count', () => {
    render(<CharacterCount current={20} max={100} />);
    expect(screen.getByText('80 of 100 characters remaining')).toBeInTheDocument();
  });

  it('renders over-limit message', () => {
    render(<CharacterCount current={110} max={100} />);
    expect(screen.getByText('10 characters over limit')).toBeInTheDocument();
  });

  it('has aria-live="polite"', () => {
    render(<CharacterCount current={10} max={100} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-atomic="true"', () => {
    render(<CharacterCount current={10} max={100} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
  });

  it('updates live region as value changes', () => {
    function WithCounter() {
      const [value, setValue] = useState('');
      return (
        <>
          <TextInput
            aria-label="Message"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={20}
          />
          <CharacterCount current={value.length} max={20} />
        </>
      );
    }

    const user = userEvent.setup();
    render(<WithCounter />);
    expect(screen.getByRole('status')).toHaveTextContent('20 of 20 characters remaining');
    // Simulate typing
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
    expect(screen.getByRole('status')).toHaveTextContent('15 of 20 characters remaining');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="cc-input">Bio</label>
        <TextInput id="cc-input" aria-describedby="cc-count" />
        <CharacterCount id="cc-count" current={0} max={200} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});