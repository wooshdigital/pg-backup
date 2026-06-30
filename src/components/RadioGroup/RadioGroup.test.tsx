import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';

expect.extend(toHaveNoViolations);

const BasicGroup = ({
  onChange,
  defaultValue,
  value,
  disabled,
}: {
  onChange?: (val: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}) => (
  <RadioGroup
    legend="Favorite fruit"
    name="fruit"
    defaultValue={defaultValue}
    value={value}
    onChange={onChange}
    disabled={disabled}
  >
    <Radio value="apple" label="Apple" />
    <Radio value="banana" label="Banana" />
    <Radio value="cherry" label="Cherry" />
  </RadioGroup>
);

describe('RadioGroup', () => {
  it('renders a radiogroup with legend', () => {
    render(<BasicGroup />);
    expect(screen.getByRole('radiogroup', { name: 'Favorite fruit' })).toBeInTheDocument();
  });

  it('renders all radio options', () => {
    render(<BasicGroup />);
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Cherry' })).toBeInTheDocument();
  });

  it('all radios share the same name attribute', () => {
    render(<BasicGroup />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    const names = radios.map((r) => r.name);
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBe('fruit');
  });

  it('selects a radio when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicGroup onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Apple' }));
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('reflects defaultValue (uncontrolled)', () => {
    render(<BasicGroup defaultValue="banana" />);
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
  });

  it('reflects controlled value', () => {
    render(<BasicGroup value="cherry" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Cherry' })).toBeChecked();
  });

  it('navigates forward with ArrowDown key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicGroup defaultValue="apple" onChange={onChange} />);
    const apple = screen.getByRole('radio', { name: 'Apple' });
    apple.focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('banana');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Banana' }));
  });

  it('navigates backward with ArrowUp key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicGroup defaultValue="banana" onChange={onChange} />);
    const banana = screen.getByRole('radio', { name: 'Banana' });
    banana.focus();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('apple');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Apple' }));
  });

  it('navigates forward with ArrowRight key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicGroup defaultValue="apple" onChange={onChange} />);
    screen.getByRole('radio', { name: 'Apple' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('banana');
  });

  it('navigates backward with ArrowLeft key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicGroup defaultValue="banana" onChange={onChange} />);
    screen.getByRole('radio', { name: 'Banana' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('apple');
  });

  it('wraps from last to first on ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicGroup defaultValue="cherry" onChange={onChange} />);
    screen.getByRole('radio', { name: 'Cherry' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('apple');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Apple' }));
  });

  it('wraps from first to last on ArrowUp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BasicGroup defaultValue="apple" onChange={onChange} />);
    screen.getByRole('radio', { name: 'Apple' }).focus();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('cherry');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Cherry' }));
  });

  it('skips disabled options during arrow key navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup legend="Fruit" name="fruit-skip" defaultValue="apple" onChange={onChange}>
        <Radio value="apple" label="Apple" />
        <Radio value="banana" label="Banana" disabled />
        <Radio value="cherry" label="Cherry" />
      </RadioGroup>
    );
    screen.getByRole('radio', { name: 'Apple' }).focus();
    await user.keyboard('{ArrowDown}');
    // Banana is disabled, should skip to Cherry
    expect(onChange).toHaveBeenLastCalledWith('cherry');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Cherry' }));
  });

  it('implements roving tabindex — only focused radio has tabIndex 0', async () => {
    const user = userEvent.setup();
    render(<BasicGroup defaultValue="apple" />);
    const apple = screen.getByRole('radio', { name: 'Apple' }) as HTMLInputElement;
    const banana = screen.getByRole('radio', { name: 'Banana' }) as HTMLInputElement;
    const cherry = screen.getByRole('radio', { name: 'Cherry' }) as HTMLInputElement;

    // Initially, the selected radio should have tabIndex 0
    expect(apple.tabIndex).toBe(0);
    expect(banana.tabIndex).toBe(-1);
    expect(cherry.tabIndex).toBe(-1);

    apple.focus();
    await user.keyboard('{ArrowDown}');

    // After moving, banana should be focused and have tabIndex 0
    expect(banana.tabIndex).toBe(0);
    expect(apple.tabIndex).toBe(-1);
    expect(cherry.tabIndex).toBe(-1);
  });

  it('disables all radios when group is disabled', () => {
    render(<BasicGroup disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('shows error message', () => {
    render(
      <RadioGroup legend="Choose" name="choose" errorMessage="Please select an option">
        <Radio value="a" label="Option A" />
      </RadioGroup>
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(
      <RadioGroup legend="Choose" name="choose" helperText="Select one option">
        <Radio value="a" label="Option A" />
      </RadioGroup>
    );
    expect(screen.getByText('Select one option')).toBeInTheDocument();
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    const ControlledGroup = () => {
      const [value, setValue] = useState('apple');
      return (
        <RadioGroup legend="Fruit" name="fruit-controlled" value={value} onChange={setValue}>
          <Radio value="apple" label="Apple" />
          <Radio value="banana" label="Banana" />
          <Radio value="cherry" label="Cherry" />
        </RadioGroup>
      );
    };
    render(<ControlledGroup />);
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Banana' }));
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
  });

  it('has no accessibility violations (basic)', async () => {
    const { container } = render(<BasicGroup />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (with selection)', async () => {
    const { container } = render(<BasicGroup defaultValue="apple" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (with error)', async () => {
    const { container } = render(
      <RadioGroup legend="Fruit" name="fruit-err" errorMessage="Required field">
        <Radio value="apple" label="Apple" />
        <Radio value="banana" label="Banana" />
      </RadioGroup>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (disabled)', async () => {
    const { container } = render(<BasicGroup disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (horizontal)', async () => {
    const { container } = render(
      <RadioGroup legend="Fruit" name="fruit-h" orientation="horizontal">
        <Radio value="apple" label="Apple" />
        <Radio value="banana" label="Banana" />
      </RadioGroup>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});