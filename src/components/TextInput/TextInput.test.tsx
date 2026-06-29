import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormField } from '../FormField/FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

expect.extend(toHaveNoViolations);

describe('TextInput', () => {
  it('renders an input element', () => {
    render(<TextInput aria-label="Name" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards ref to underlying input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TextInput aria-label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads standard HTML input attributes', () => {
    render(
      <TextInput
        aria-label="Name"
        placeholder="Enter name"
        maxLength={50}
        data-testid="my-input"
      />
    );
    const input = screen.getByTestId('my-input');
    expect(input).toHaveAttribute('placeholder', 'Enter name');
    expect(input).toHaveAttribute('maxlength', '50');
  });

  it('works as a controlled input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput aria-label="Name" value="hello" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('hello');
    await user.type(input, 'x');
    expect(onChange).toHaveBeenCalled();
  });

  it('works as an uncontrolled input', async () => {
    const user = userEvent.setup();
    render(<TextInput aria-label="Name" defaultValue="initial" />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'new value');
    expect(input).toHaveValue('new value');
  });

  it('sets aria-invalid when validationState is error', () => {
    render(<TextInput aria-label="Email" validationState="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when validationState is success', () => {
    render(<TextInput aria-label="Email" validationState="success" />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('auto-wires aria-describedby from FormFieldContext (helperId + errorId)', () => {
    render(
      <FormField>
        <Label>Email</Label>
        <TextInput />
        <HelperText>We will never share your email.</HelperText>
        <ErrorMessage>Invalid email address.</ErrorMessage>
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    const helperText = screen.getByText('We will never share your email.');
    const errorText = screen.getByText('Invalid email address.');
    expect(describedBy).toContain(helperText.id);
    expect(describedBy).toContain(errorText.id);
  });

  it('combines explicit aria-describedby with context ids', () => {
    render(
      <FormField>
        <Label>Email</Label>
        <TextInput aria-describedby="custom-desc" />
        <HelperText>Helper</HelperText>
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('custom-desc');
  });

  it('renders prefix slot', () => {
    render(<TextInput aria-label="Email" prefix={<span data-testid="prefix-icon">@</span>} />);
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
  });

  it('renders suffix slot', () => {
    render(<TextInput aria-label="Search" suffix={<span data-testid="suffix-icon">🔍</span>} />);
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<TextInput aria-label="Name" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is readonly when readOnly prop is set', () => {
    render(<TextInput aria-label="Name" readOnly value="readonly value" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <FormField>
        <Label>Email Address</Label>
        <TextInput type="email" />
        <HelperText>Enter your email.</HelperText>
      </FormField>
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

  it('announces over-limit state', () => {
    render(<CharacterCount current={110} max={100} />);
    expect(screen.getByText('10 characters over limit')).toBeInTheDocument();
  });

  it('has aria-live="polite" for announcements', () => {
    render(<CharacterCount current={5} max={50} />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('updates live region as user types', async () => {
    const user = userEvent.setup();

    function ControlledInput() {
      const [value, setValue] = useState('');
      return (
        <>
          <TextInput
            aria-label="Bio"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={20}
          />
          <CharacterCount current={value.length} max={20} />
        </>
      );
    }

    render(<ControlledInput />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    expect(screen.getByRole('status')).toHaveTextContent('15 of 20 characters remaining');
  });

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <>
        <label htmlFor="bio">Bio</label>
        <input id="bio" aria-describedby="bio-count" />
        <CharacterCount id="bio-count" current={10} max={100} />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});