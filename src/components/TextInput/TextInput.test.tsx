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
  it('renders a native input element', () => {
    render(<TextInput aria-label="Test input" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TextInput ref={ref} aria-label="ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads arbitrary HTML attributes', () => {
    render(<TextInput aria-label="test" data-testid="my-input" placeholder="Enter text" />);
    const input = screen.getByTestId('my-input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('supports controlled mode', async () => {
    const onChange = vi.fn();
    render(<TextInput aria-label="controlled" value="hello" onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('hello');
    fireEvent.change(input, { target: { value: 'world' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports uncontrolled mode with defaultValue', () => {
    render(<TextInput aria-label="uncontrolled" defaultValue="initial" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
  });

  it('applies aria-invalid when validationState is error', () => {
    render(<TextInput aria-label="error input" validationState="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not apply aria-invalid for success state', () => {
    render(<TextInput aria-label="success input" validationState="success" />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('wires aria-describedby from FormFieldContext', () => {
    render(
      <FormField>
        <Label>Name</Label>
        <TextInput />
        <HelperText>Enter your full name</HelperText>
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const helperText = screen.getByText('Enter your full name');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby')).toContain(helperText.id);
  });

  it('includes error id in aria-describedby when FormField has error', () => {
    render(
      <FormField error="Field is required">
        <Label>Name</Label>
        <TextInput />
        <ErrorMessage>Field is required</ErrorMessage>
      </FormField>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    const errorMsg = screen.getByRole('alert');
    expect(describedBy).toContain(errorMsg.id);
  });

  it('merges caller-supplied aria-describedby with context ids', () => {
    render(
      <FormField>
        <TextInput aria-describedby="custom-hint" />
        <HelperText>hint</HelperText>
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('custom-hint');
  });

  it('renders prefix slot', () => {
    render(<TextInput aria-label="with prefix" prefix={<span>$</span>} />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders suffix slot', () => {
    render(<TextInput aria-label="with suffix" suffix={<span>🔍</span>} />);
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('passes inputMode to the input element', () => {
    render(<TextInput aria-label="numeric" inputMode="numeric" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
  });

  it('is disabled when disabled prop is set', () => {
    render(<TextInput aria-label="disabled" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is readonly when readOnly prop is set', () => {
    render(<TextInput aria-label="readonly" readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FormField>
        <Label>Email address</Label>
        <TextInput type="email" />
        <HelperText>We will never share your email</HelperText>
      </FormField>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in error state', async () => {
    const { container } = render(
      <FormField error="Invalid email">
        <Label>Email address</Label>
        <TextInput type="email" />
        <ErrorMessage>Invalid email</ErrorMessage>
      </FormField>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('CharacterCount', () => {
  it('renders visible count', () => {
    render(<CharacterCount current={20} max={100} />);
    expect(screen.getByText('20/100')).toBeInTheDocument();
  });

  it('renders accessible remaining message', () => {
    render(<CharacterCount current={20} max={100} />);
    expect(screen.getByText('80 of 100 characters remaining')).toBeInTheDocument();
  });

  it('renders exceeded message when over limit', () => {
    render(<CharacterCount current={105} max={100} />);
    expect(screen.getByText('5 characters over the limit of 100')).toBeInTheDocument();
  });

  it('has aria-live polite', () => {
    render(<CharacterCount current={0} max={50} />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('announces updates as user types', async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <>
          <input
            aria-label="message"
            value={value}
            onChange={e => setValue(e.target.value)}
            maxLength={20}
          />
          <CharacterCount current={value.length} max={20} />
        </>
      );
    }

    render(<Controlled />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(screen.getByText('15 of 20 characters remaining')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CharacterCount current={40} max={100} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});