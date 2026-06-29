import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

// Helper to wrap in a label for axe accessibility
function WithLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor="test-input">Name</label>
      {children}
    </div>
  );
}

describe('TextInput', () => {
  describe('Rendering', () => {
    it('renders an input element', () => {
      render(<TextInput id="test-input" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('forwards ref to the input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<TextInput ref={ref} id="test-input" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('spreads extra props onto the native input', () => {
      render(<TextInput id="test-input" placeholder="Enter text" data-testid="my-input" />);
      const input = screen.getByTestId('my-input');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
    });

    it('renders prefix slot', () => {
      render(<TextInput id="test-input" prefix={<span>$</span>} />);
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('renders suffix slot', () => {
      render(<TextInput id="test-input" suffix={<span>USD</span>} />);
      expect(screen.getByText('USD')).toBeInTheDocument();
    });
  });

  describe('ARIA wiring', () => {
    it('applies aria-describedby from FormFieldContext', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'test-input', helperId: 'helper-1', errorId: 'error-1', hasError: false, required: false }}
        >
          <TextInput id="test-input" />
        </FormFieldContext.Provider>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'helper-1 error-1');
    });

    it('combines context aria-describedby with caller-provided aria-describedby', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'test-input', helperId: 'helper-1', errorId: undefined, hasError: false, required: false }}
        >
          <TextInput id="test-input" aria-describedby="extra-1" />
        </FormFieldContext.Provider>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'helper-1 extra-1');
    });

    it('sets aria-invalid from context hasError', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'test-input', helperId: undefined, errorId: 'error-1', hasError: true, required: false }}
        >
          <TextInput id="test-input" />
        </FormFieldContext.Provider>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-required from context required', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'test-input', helperId: undefined, errorId: undefined, hasError: false, required: true }}
        >
          <TextInput id="test-input" />
        </FormFieldContext.Provider>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('caller aria-invalid overrides context', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'test-input', helperId: undefined, errorId: undefined, hasError: true, required: false }}
        >
          <TextInput id="test-input" aria-invalid={false} />
        </FormFieldContext.Provider>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Controlled mode', () => {
    it('reflects controlled value', () => {
      render(<TextInput id="test-input" value="hello" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('hello');
    });

    it('calls onChange when value changes', async () => {
      const onChange = vi.fn();
      render(<TextInput id="test-input" value="" onChange={onChange} />);
      await userEvent.type(screen.getByRole('textbox'), 'a');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Uncontrolled mode', () => {
    it('accepts defaultValue', () => {
      render(<TextInput id="test-input" defaultValue="default text" />);
      expect(screen.getByRole('textbox')).toHaveValue('default text');
    });
  });

  describe('Disabled and readonly', () => {
    it('is disabled when disabled prop passed', () => {
      render(<TextInput id="test-input" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('is readonly when readOnly prop passed', () => {
      render(<TextInput id="test-input" readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });

  describe('inputMode', () => {
    it('passes inputMode to native input', () => {
      render(<TextInput id="test-input" inputMode="numeric" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
    });
  });

  describe('Accessibility (axe)', () => {
    it('passes axe with a label', async () => {
      const { container } = render(
        <WithLabel>
          <TextInput id="test-input" />
        </WithLabel>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe in error state', async () => {
      const { container } = render(
        <div>
          <label htmlFor="err-input">Email</label>
          <TextInput id="err-input" validationState="error" aria-invalid={true} aria-describedby="err-msg" />
          <span id="err-msg" role="alert">Invalid email</span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('CharacterCount', () => {
  it('renders remaining count message', () => {
    render(<CharacterCount current={20} max={100} />);
    expect(screen.getByText('80 of 100 characters remaining')).toBeInTheDocument();
  });

  it('renders over-limit message when current exceeds max', () => {
    render(<CharacterCount current={105} max={100} />);
    expect(screen.getByText('5 characters over the limit')).toBeInTheDocument();
  });

  it('renders singular "character" when 1 remaining', () => {
    render(<CharacterCount current={99} max={100} />);
    expect(screen.getByText('1 of 100 character remaining')).toBeInTheDocument();
  });

  it('has aria-live="polite" and role="status"', () => {
    render(<CharacterCount current={50} max={100} id="char-count" />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });

  it('updates live region as user types', async () => {
    function Controlled() {
      const [val, setVal] = useState('');
      return (
        <>
          <label htmlFor="ci">Text</label>
          <TextInput id="ci" value={val} onChange={(e) => setVal(e.target.value)} maxLength={10} />
          <CharacterCount current={val.length} max={10} />
        </>
      );
    }
    render(<Controlled />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello');
    expect(screen.getByRole('status')).toHaveTextContent('5 of 10 characters remaining');
  });

  it('passes axe', async () => {
    const { container } = render(
      <div>
        <label htmlFor="cc-input">Comment</label>
        <TextInput id="cc-input" />
        <CharacterCount current={30} max={200} id="cc-count" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});