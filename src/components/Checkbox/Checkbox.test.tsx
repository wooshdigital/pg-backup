import React, { useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

expect.extend(toHaveNoViolations);

describe('Checkbox', () => {
  it('renders with a label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Checkbox label="Option" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('can be checked by clicking the label', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Option" onChange={onChange} />);
    await user.click(screen.getByText('Option'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.checked).toBe(true);
  });

  it('can be toggled with Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Option" onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reflects controlled checked state', () => {
    render(<Checkbox label="Option" checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('reflects controlled unchecked state', () => {
    render(<Checkbox label="Option" checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('supports indeterminate state via ref', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLInputElement>(null);
      return <Checkbox ref={ref} label="Select all" indeterminate={true} onChange={() => {}} />;
    };
    render(<TestComponent />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it('is disabled when disabled prop is set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Option" disabled onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks as invalid with aria-invalid when hasError is true', () => {
    render(<Checkbox label="Option" hasError />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports controlled toggle behavior', async () => {
    const user = userEvent.setup();
    const ControlledCheckbox = () => {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          label="Toggle me"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      );
    };
    render(<ControlledCheckbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Checkbox label="Accessible checkbox" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when checked', async () => {
    const { container } = render(
      <Checkbox label="Accessible checkbox" checked onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when disabled', async () => {
    const { container } = render(<Checkbox label="Accessible checkbox" disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('CheckboxGroup', () => {
  it('renders a fieldset with legend', () => {
    render(
      <CheckboxGroup legend="Preferences">
        <Checkbox label="Email" />
        <Checkbox label="SMS" />
      </CheckboxGroup>
    );
    expect(screen.getByRole('group', { name: 'Preferences' })).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(
      <CheckboxGroup legend="Options" helperText="Choose at least one">
        <Checkbox label="A" />
      </CheckboxGroup>
    );
    expect(screen.getByText('Choose at least one')).toBeInTheDocument();
  });

  it('shows error message and hides helper text when in error state', () => {
    render(
      <CheckboxGroup
        legend="Options"
        helperText="Choose at least one"
        errorMessage="Please select an option"
      >
        <Checkbox label="A" />
      </CheckboxGroup>
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
    expect(screen.queryByText('Choose at least one')).not.toBeInTheDocument();
  });

  it('marks group as aria-invalid when error is present', () => {
    render(
      <CheckboxGroup legend="Options" errorMessage="Required">
        <Checkbox label="A" />
      </CheckboxGroup>
    );
    const fieldset = screen.getByRole('group', { name: 'Options' }).closest('fieldset');
    expect(fieldset).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CheckboxGroup legend="Preferences">
        <Checkbox label="Email notifications" name="pref" value="email" />
        <Checkbox label="SMS notifications" name="pref" value="sms" />
      </CheckboxGroup>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('individual checkboxes within group can be toggled independently', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxGroup legend="Options">
        <Checkbox label="Email" onChange={onChange} />
        <Checkbox label="SMS" onChange={onChange} />
      </CheckboxGroup>
    );
    await user.click(screen.getByRole('checkbox', { name: 'Email' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('checkbox', { name: 'SMS' }));
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});