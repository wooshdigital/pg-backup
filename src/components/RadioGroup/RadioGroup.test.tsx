import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';

expect.extend(toHaveNoViolations);

const BasicGroup = (props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) => (
  <RadioGroup legend="Choose a fruit" name="fruit" {...props}>
    <Radio value="apple" label="Apple" />
    <Radio value="banana" label="Banana" />
    <Radio value="cherry" label="Cherry" />
  </RadioGroup>
);

describe('RadioGroup', () => {
  it('renders a radiogroup with legend', () => {
    render(<BasicGroup />);
    expect(
      screen.getByRole('radiogroup', { name: 'Choose a fruit' })
    ).toBeInTheDocument();
  });

  it('renders all radio buttons', () => {
    render(<BasicGroup />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('associates radios with the group name', () => {
    render(<BasicGroup />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    radios.forEach((radio) => {
      expect(radio.name).toBe('fruit');
    });
  });

  it('selects a radio on click', async () => {
    const user = userEvent.setup();
    render(<BasicGroup />);
    await user.click(screen.getByLabelText('Banana'));
    expect(screen.getByLabelText('Banana')).toBeChecked();
    expect(screen.getByLabelText('Apple')).not.toBeChecked();
  });

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<BasicGroup onChange={handleChange} />);
    await user.click(screen.getByLabelText('Cherry'));
    expect(handleChange).toHaveBeenCalledWith('cherry');
  });

  it('respects defaultValue', () => {
    render(<BasicGroup defaultValue="banana" />);
    expect(screen.getByLabelText('Banana')).toBeChecked();
  });

  it('respects controlled value', () => {
    render(<BasicGroup value="apple" onChange={() => {}} />);
    expect(screen.getByLabelText('Apple')).toBeChecked();
    expect(screen.getByLabelText('Banana')).not.toBeChecked();
  });

  it('updates controlled value when prop changes', () => {
    const { rerender } = render(
      <BasicGroup value="apple" onChange={() => {}} />
    );
    expect(screen.getByLabelText('Apple')).toBeChecked();
    rerender(<BasicGroup value="cherry" onChange={() => {}} />);
    expect(screen.getByLabelText('Cherry')).toBeChecked();
    expect(screen.getByLabelText('Apple')).not.toBeChecked();
  });

  it('disables all radios when group is disabled', () => {
    render(<BasicGroup disabled />);
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('disables a single radio', () => {
    render(
      <RadioGroup legend="Choose" name="opt">
        <Radio value="a" label="Option A" />
        <Radio value="b" label="Option B" disabled />
        <Radio value="c" label="Option C" />
      </RadioGroup>
    );
    expect(screen.getByLabelText('Option B')).toBeDisabled();
    expect(screen.getByLabelText('Option A')).not.toBeDisabled();
  });

  it('shows error message', () => {
    render(<BasicGroup error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<BasicGroup helperText="Select your favorite fruit" />);
    expect(screen.getByText('Select your favorite fruit')).toBeInTheDocument();
  });

  describe('Keyboard navigation (roving tabindex)', () => {
    it('moves focus to next radio with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<BasicGroup defaultValue="apple" />);
      const apple = screen.getByLabelText('Apple');
      apple.focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByLabelText('Banana')).toHaveFocus();
    });

    it('moves focus to previous radio with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<BasicGroup defaultValue="banana" />);
      const banana = screen.getByLabelText('Banana');
      banana.focus();
      await user.keyboard('{ArrowUp}');
      expect(screen.getByLabelText('Apple')).toHaveFocus();
    });

    it('moves focus to next radio with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<BasicGroup defaultValue="apple" />);
      screen.getByLabelText('Apple').focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByLabelText('Banana')).toHaveFocus();
    });

    it('moves focus to previous radio with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<BasicGroup defaultValue="banana" />);
      screen.getByLabelText('Banana').focus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByLabelText('Apple')).toHaveFocus();
    });

    it('wraps from last to first with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<BasicGroup defaultValue="cherry" />);
      screen.getByLabelText('Cherry').focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByLabelText('Apple')).toHaveFocus();
    });

    it('wraps from first to last with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<BasicGroup defaultValue="apple" />);
      screen.getByLabelText('Apple').focus();
      await user.keyboard('{ArrowUp}');
      expect(screen.getByLabelText('Cherry')).toHaveFocus();
    });

    it('selects the radio when navigating with arrow keys', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<BasicGroup defaultValue="apple" onChange={handleChange} />);
      screen.getByLabelText('Apple').focus();
      await user.keyboard('{ArrowDown}');
      expect(handleChange).toHaveBeenCalledWith('banana');
    });

    it('skips disabled radios during keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup legend="Choose" name="opts">
          <Radio value="a" label="Option A" />
          <Radio value="b" label="Option B" disabled />
          <Radio value="c" label="Option C" />
        </RadioGroup>
      );
      screen.getByLabelText('Option A').focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByLabelText('Option C')).toHaveFocus();
    });

    it('roving tabindex: only focused radio has tabIndex=0', async () => {
      const user = userEvent.setup();
      render(<BasicGroup defaultValue="apple" />);

      const apple = screen.getByLabelText('Apple') as HTMLInputElement;
      const banana = screen.getByLabelText('Banana') as HTMLInputElement;
      const cherry = screen.getByLabelText('Cherry') as HTMLInputElement;

      // Apple is default selected, so it starts with tabIndex=0
      apple.focus();
      expect(apple.tabIndex).toBe(0);
      expect(banana.tabIndex).toBe(-1);
      expect(cherry.tabIndex).toBe(-1);

      await user.keyboard('{ArrowDown}');
      expect(banana.tabIndex).toBe(0);
      expect(apple.tabIndex).toBe(-1);
      expect(cherry.tabIndex).toBe(-1);
    });
  });

  describe('Controlled RadioGroup', () => {
    it('works as a controlled component', async () => {
      const user = userEvent.setup();
      const ControlledGroup = () => {
        const [value, setValue] = useState('apple');
        return (
          <div>
            <span data-testid="value">{value}</span>
            <RadioGroup
              legend="Choose a fruit"
              name="fruit-ctrl"
              value={value}
              onChange={setValue}
            >
              <Radio value="apple" label="Apple" />
              <Radio value="banana" label="Banana" />
              <Radio value="cherry" label="Cherry" />
            </RadioGroup>
          </div>
        );
      };

      render(<ControlledGroup />);
      expect(screen.getByTestId('value')).toHaveTextContent('apple');
      await user.click(screen.getByLabelText('Cherry'));
      expect(screen.getByTestId('value')).toHaveTextContent('cherry');
    });
  });

  describe('Accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<BasicGroup />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations with defaultValue', async () => {
      const { container } = render(<BasicGroup defaultValue="apple" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations when disabled', async () => {
      const { container } = render(<BasicGroup disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations with error', async () => {
      const { container } = render(<BasicGroup error="Required field" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations with required', async () => {
      const { container } = render(<BasicGroup required />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});