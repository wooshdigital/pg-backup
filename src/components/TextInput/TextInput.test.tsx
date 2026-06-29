import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormField } from '../FormField';

expect.extend(toHaveNoViolations);

// ── Accessibility ──────────────────────────────────────────────────────────

describe('TextInput – accessibility', () => {
  it('has no axe violations in default state', async () => {
    const { container } = render(
      <label htmlFor="t1">
        Name
        <TextInput id="t1" placeholder="Enter name" />
      </label>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in error state', async () => {
    const { container } = render(
      <FormField hasError>
        <TextInput aria-label="Email" />
      </FormField>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ── ARIA wiring ────────────────────────────────────────────────────────────

describe('TextInput – ARIA wiring', () => {
  it('forwards aria-invalid from context when hasError is true', () => {
    render(
      <FormField hasError>
        <TextInput aria-label="Field" />
      </FormField>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('combines helperId and errorId into aria-describedby', () => {
    render(
      <FormField helperId="help-1" errorId="err-1">
        <TextInput aria-label="Field" />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('help-1');
    expect(describedBy).toContain('err-1');
  });

  it('merges caller-supplied aria-describedby with context ids', () => {
    render(
      <FormField helperId="help-2">
        <TextInput aria-label="Field" aria-describedby="custom-id" />
      </FormField>,
    );
    const describedBy = screen.getByRole('textbox').getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('help-2');
    expect(describedBy).toContain('custom-id');
  });

  it('sets aria-required when context required is true', () => {
    render(
      <FormField required>
        <TextInput aria-label="Field" />
      </FormField>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });
});

// ── Controlled / Uncontrolled ──────────────────────────────────────────────

describe('TextInput – controlled mode', () => {
  it('renders with controlled value', () => {
    render(<TextInput aria-label="Field" value="hello" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput aria-label="Field" defaultValue="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('TextInput – uncontrolled mode', () => {
  it('updates its value independently', async () => {
    const user = userEvent.setup();
    render(<TextInput aria-label="Field" defaultValue="initial" />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'new value');
    expect(input).toHaveValue('new value');
  });
});

// ── CharacterCount announcements ───────────────────────────────────────────

describe('CharacterCount', () => {
  it('shows remaining count', () => {
    render(<CharacterCount current={20} max={100} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    // The numeric display
    expect(screen.getByText('20/100')).toBeInTheDocument();
  });

  it('applies warning class when approaching limit', () => {
    const { container } = render(<CharacterCount current={85} max={100} />);
    expect(container.querySelector('.warning')).not.toBeNull();
  });

  it('applies error class when over limit', () => {
    const { container } = render(<CharacterCount current={105} max={100} />);
    expect(container.querySelector('.error')).not.toBeNull();
  });

  it('live region updates as user types', async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [val, setVal] = useState('');
      return (
        <>
          <TextInput
            aria-label="Bio"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            maxLength={10}
          />
          <CharacterCount current={val.length} max={10} />
        </>
      );
    }

    render(<Wrapper />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });
});

// ── Prefix / Suffix ────────────────────────────────────────────────────────

describe('TextInput – prefix / suffix', () => {
  it('renders prefix node', () => {
    render(<TextInput aria-label="Search" prefix={<span data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders suffix node', () => {
    render(<TextInput aria-label="Search" suffix={<span data-testid="suffix-icon" />} />);
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });
});

// ── inputMode ─────────────────────────────────────────────────────────────

describe('TextInput – inputMode', () => {
  it('sets inputMode="numeric" for numeric keyboards', () => {
    render(<TextInput aria-label="Amount" inputMode="numeric" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
  });

  it('sets inputMode="email" for email keyboards', () => {
    render(<TextInput aria-label="Email" inputMode="email" type="email" />);
    // type=email renders a generic input in jsdom
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('inputmode', 'email');
  });
});