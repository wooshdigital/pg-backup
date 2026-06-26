import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderWithFieldCtx(
  ui: React.ReactElement,
  ctx: Partial<React.ContextType<typeof FormFieldContext>> = {}
) {
  const defaultCtx = {
    inputId: 'field-input',
    helperId: 'field-helper',
    errorId: 'field-error',
    hasError: false,
    required: false,
    ...ctx,
  };
  return render(
    <FormFieldContext.Provider value={defaultCtx as any}>{ui}</FormFieldContext.Provider>
  );
}

// ── Basic rendering ───────────────────────────────────────────────────────────

describe('TextInput – rendering', () => {
  it('renders a native input element', () => {
    render(<TextInput data-testid="inp" />);
    expect(screen.getByTestId('inp').tagName).toBe('INPUT');
  });

  it('forwards the ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TextInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders prefix and suffix slots', () => {
    render(<TextInput prefix={<span data-testid="pre">@</span>} suffix={<span data-testid="suf">✓</span>} />);
    expect(screen.getByTestId('pre')).toBeInTheDocument();
    expect(screen.getByTestId('suf')).toBeInTheDocument();
  });

  it('spreads additional HTML attributes to the native input', () => {
    render(<TextInput placeholder="Enter text" maxLength={50} data-testid="inp" />);
    const input = screen.getByTestId('inp');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('maxLength', '50');
  });
});

// ── ARIA wiring ───────────────────────────────────────────────────────────────

describe('TextInput – ARIA', () => {
  it('auto-wires aria-describedby from FormFieldContext', () => {
    renderWithFieldCtx(<TextInput data-testid="inp" />);
    const input = screen.getByTestId('inp');
    expect(input).toHaveAttribute('aria-describedby', 'field-helper field-error');
  });

  it('merges caller-supplied aria-describedby with context ids', () => {
    renderWithFieldCtx(<TextInput data-testid="inp" aria-describedby="extra-desc" />);
    expect(screen.getByTestId('inp')).toHaveAttribute(
      'aria-describedby',
      'field-helper field-error extra-desc'
    );
  });

  it('sets aria-invalid=true when context hasError=true', () => {
    renderWithFieldCtx(<TextInput data-testid="inp" />, { hasError: true });
    expect(screen.getByTestId('inp')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid=true when validationState="error"', () => {
    render(<TextInput data-testid="inp" validationState="error" />);
    expect(screen.getByTestId('inp')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required from context', () => {
    renderWithFieldCtx(<TextInput data-testid="inp" />, { required: true });
    expect(screen.getByTestId('inp')).toHaveAttribute('aria-required', 'true');
  });

  it('sets aria-required from required prop', () => {
    render(<TextInput data-testid="inp" required />);
    expect(screen.getByTestId('inp')).toHaveAttribute('aria-required', 'true');
  });

  it('uses the id from FormFieldContext when no id prop is given', () => {
    renderWithFieldCtx(<TextInput data-testid="inp" />);
    expect(screen.getByTestId('inp')).toHaveAttribute('id', 'field-input');
  });

  it('prefers explicit id prop over context id', () => {
    renderWithFieldCtx(<TextInput data-testid="inp" id="my-id" />);
    expect(screen.getByTestId('inp')).toHaveAttribute('id', 'my-id');
  });
});

// ── inputMode ─────────────────────────────────────────────────────────────────

describe('TextInput – inputMode', () => {
  it.each(['numeric', 'email', 'url', 'tel', 'decimal'] as const)(
    'passes inputMode="%s" to the native input',
    (mode) => {
      render(<TextInput data-testid="inp" inputMode={mode} />);
      expect(screen.getByTestId('inp')).toHaveAttribute('inputmode', mode);
    }
  );
});

// ── Controlled / Uncontrolled ─────────────────────────────────────────────────

describe('TextInput – controlled mode', () => {
  it('reflects value updates in controlled mode', async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [val, setVal] = useState('');
      return <TextInput data-testid="inp" value={val} onChange={(e) => setVal(e.target.value)} />;
    }

    render(<Controlled />);
    const input = screen.getByTestId('inp') as HTMLInputElement;
    await user.type(input, 'hello');
    expect(input.value).toBe('hello');
  });

  it('works as an uncontrolled input with defaultValue', () => {
    render(<TextInput data-testid="inp" defaultValue="initial" />);
    expect((screen.getByTestId('inp') as HTMLInputElement).value).toBe('initial');
  });
});

// ── CharacterCount ────────────────────────────────────────────────────────────

describe('CharacterCount', () => {
  it('renders remaining count message', () => {
    render(<CharacterCount current={20} max={100} />);
    expect(screen.getByText('80 of 100 characters remaining')).toBeInTheDocument();
  });

  it('renders singular "character" when 1 remains', () => {
    render(<CharacterCount current={99} max={100} />);
    expect(screen.getByText('1 of 100 characters remaining')).toBeInTheDocument();
  });

  it('renders over-limit message when current exceeds max', () => {
    render(<CharacterCount current={105} max={100} />);
    expect(screen.getByText('5 characters over limit')).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen reader announcements', () => {
    render(<CharacterCount current={0} max={50} id="char-count" />);
    const el = screen.getByText(/characters remaining/);
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });

  it('updates live region when current changes', () => {
    function Wrapper() {
      const [val, setVal] = useState('');
      return (
        <>
          <TextInput
            data-testid="inp"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            maxLength={20}
          />
          <CharacterCount current={val.length} max={20} />
        </>
      );
    }

    render(<Wrapper />);
    fireEvent.change(screen.getByTestId('inp'), { target: { value: 'hello' } });
    expect(screen.getByText('15 of 20 characters remaining')).toBeInTheDocument();
  });
});

// ── Axe accessibility ─────────────────────────────────────────────────────────

describe('TextInput – axe', () => {
  it('has no accessibility violations (labelled input)', async () => {
    const { container } = render(
      <div>
        <label htmlFor="a11y-input">Name</label>
        <TextInput id="a11y-input" data-testid="inp" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with validation error', async () => {
    const { container } = render(
      <div>
        <label htmlFor="a11y-input2">Email</label>
        <TextInput id="a11y-input2" validationState="error" aria-describedby="err" />
        <span id="err" role="alert">
          Invalid email
        </span>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});