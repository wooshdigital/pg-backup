import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

expect.extend(toHaveNoViolations);

describe('Checkbox', () => {
  it('renders with a label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Checkbox label="Option" />);
    expect(screen.getByRole('checkbox', { name: 'Option' })).not.toBeChecked();
  });

  it('can be checked by clicking the label', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox label="Option" onChange={handleChange} />);
    await user.click(screen.getByLabelText('Option'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('toggles checked state on Space key', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Option" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Option' });
    checkbox.focus();
    await user.keyboard(' ');
    expect(checkbox).toBeChecked();
    await user.keyboard(' ');
    expect(checkbox).not.toBeChecked();
  });

  it('renders as checked when defaultChecked is set', () => {
    render(<Checkbox label="Option" defaultChecked />);
    expect(screen.getByRole('checkbox', { name: 'Option' })).toBeChecked();
  });

  it('renders as disabled', () => {
    render(<Checkbox label="Option" disabled />);
    expect(screen.getByRole('checkbox', { name: 'Option' })).toBeDisabled();
  });

  it('does not fire onChange when disabled and clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox label="Option" disabled onChange={handleChange} />);
    await user.click(screen.getByLabelText('Option'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports indeterminate state via ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Option" ref={ref} indeterminate />);
    expect(ref.current?.indeterminate).toBe(true);
  });

  it('clears indeterminate when prop is false', () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(
      <Checkbox label="Option" ref={ref} indeterminate />
    );
    expect(ref.current?.indeterminate).toBe(true);
    rerender(<Checkbox label="Option" ref={ref} indeterminate={false} />);
    expect(ref.current?.indeterminate).toBe(false);
  });

  it('shows helper text', () => {
    render(<Checkbox label="Option" helperText="This is helper text" />);
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('shows error message and sets aria-invalid', () => {
    render(<Checkbox label="Option" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Option' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('prefers error over helperText when both provided', () => {
    render(
      <Checkbox
        label="Option"
        error="Error message"
        helperText="Helper text"
      />
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('supports controlled checked state', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox label="Option" checked={false} onChange={handleChange} />
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Option' });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Checkbox label="Accept terms" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations when checked', async () => {
    const { container } = render(
      <Checkbox label="Accept terms" defaultChecked />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations when disabled', async () => {
    const { container } = render(<Checkbox label="Accept terms" disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations with error', async () => {
    const { container } = render(
      <Checkbox label="Accept terms" error="Required" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('CheckboxGroup', () => {
  const renderGroup = (props = {}) =>
    render(
      <CheckboxGroup legend="Choose options" {...props}>
        <Checkbox label="Option A" name="options" value="a" />
        <Checkbox label="Option B" name="options" value="b" />
        <Checkbox label="Option C" name="options" value="c" />
      </CheckboxGroup>
    );

  it('renders a fieldset with legend', () => {
    renderGroup();
    expect(screen.getByRole('group', { name: 'Choose options' })).toBeInTheDocument();
  });

  it('renders all checkboxes', () => {
    renderGroup();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('shows error message', () => {
    renderGroup({ error: 'Select at least one' });
    expect(screen.getByText('Select at least one')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    renderGroup({ helperText: 'Select all that apply' });
    expect(screen.getByText('Select all that apply')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    renderGroup({ required: true });
    expect(screen.getByRole('group')).toHaveAttribute('aria-required', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = renderGroup();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations with error', async () => {
    const { container } = renderGroup({ error: 'Required' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});