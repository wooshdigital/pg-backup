import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';

expect.extend(toHaveNoViolations);

const DefaultGroup = ({
  onChange,
  value,
  defaultValue,
  disabled,
}: {
  onChange?: (v: string) => void;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
}) => (
  <RadioGroup
    legend="Favorite fruit"
    onChange={onChange}
    value={value}
    defaultValue={defaultValue}
    disabled={disabled}
  >
    <Radio value="apple" label="Apple" />
    <Radio value="banana" label="Banana" />
    <Radio value="cherry" label="Cherry" />
  </RadioGroup>
);

describe('RadioGroup', () => {
  describe('Rendering', () => {
    it('renders a radiogroup with legend', () => {
      render(<DefaultGroup />);
      expect(screen.getByRole('radiogroup', { name: 'Favorite fruit' })).toBeInTheDocument();
    });

    it('renders all radio options', () => {
      render(<DefaultGroup />);
      expect(screen.getAllByRole('radio')).toHaveLength(3);
      expect(screen.getByRole('radio', { name: 'Apple' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Banana' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Cherry' })).toBeInTheDocument();
    });

    it('all radios share the same name attribute', () => {
      render(<DefaultGroup />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const names = radios.map((r) => r.name);
      expect(new Set(names).size).toBe(1);
    });

    it('renders helper text', () => {
      render(
        <RadioGroup legend="Size" helperText="Choose your size">
          <Radio value="s" label="Small" />
        </RadioGroup>
      );
      expect(screen.getByText('Choose your size')).toBeInTheDocument();
    });

    it('renders error message with role=alert', () => {
      render(
        <RadioGroup legend="Size" error="Please select a size">
          <Radio value="s" label="Small" />
        </RadioGroup>
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Please select a size');
    });
  });

  describe('Selection', () => {
    it('renders defaultValue as checked', () => {
      render(<DefaultGroup defaultValue="banana" />);
      expect(screen.getByRole('radio', { name: 'Banana' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
    });

    it('renders controlled value as checked', () => {
      render(<DefaultGroup value="cherry" onChange={() => {}} />);
      expect(screen.getByRole('radio', { name: 'Cherry' })).toBeChecked();
    });

    it('calls onChange when clicking a radio', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup onChange={handleChange} />);
      await user.click(screen.getByRole('radio', { name: 'Banana' }));
      expect(handleChange).toHaveBeenCalledWith('banana');
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup disabled onChange={handleChange} />);
      await user.click(screen.getByRole('radio', { name: 'Apple' }));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Roving tabindex', () => {
    it('first radio has tabIndex=0 when no value selected', () => {
      render(<DefaultGroup />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      expect(radios[0]).toHaveAttribute('tabindex', '0');
      expect(radios[1]).toHaveAttribute('tabindex', '-1');
      expect(radios[2]).toHaveAttribute('tabindex', '-1');
    });

    it('selected radio has tabIndex=0', () => {
      render(<DefaultGroup defaultValue="banana" />);
      const apple = screen.getByRole('radio', { name: 'Apple' }) as HTMLInputElement;
      const banana = screen.getByRole('radio', { name: 'Banana' }) as HTMLInputElement;
      const cherry = screen.getByRole('radio', { name: 'Cherry' }) as HTMLInputElement;
      expect(apple).toHaveAttribute('tabindex', '-1');
      expect(banana).toHaveAttribute('tabindex', '0');
      expect(cherry).toHaveAttribute('tabindex', '-1');
    });

    it('updates tabIndex on click', async () => {
      const user = userEvent.setup();
      render(<DefaultGroup />);
      await user.click(screen.getByRole('radio', { name: 'Cherry' }));
      expect(screen.getByRole('radio', { name: 'Cherry' })).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('radio', { name: 'Apple' })).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Keyboard navigation', () => {
    it('ArrowDown moves focus to next radio', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup onChange={handleChange} />);

      const apple = screen.getByRole('radio', { name: 'Apple' });
      apple.focus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('radio', { name: 'Banana' })).toHaveFocus();
      expect(handleChange).toHaveBeenCalledWith('banana');
    });

    it('ArrowRight moves focus to next radio', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup onChange={handleChange} />);

      const apple = screen.getByRole('radio', { name: 'Apple' });
      apple.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('radio', { name: 'Banana' })).toHaveFocus();
    });

    it('ArrowUp moves focus to previous radio', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup defaultValue="banana" onChange={handleChange} />);

      const banana = screen.getByRole('radio', { name: 'Banana' });
      banana.focus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('radio', { name: 'Apple' })).toHaveFocus();
      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    it('ArrowLeft moves focus to previous radio', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup defaultValue="cherry" onChange={handleChange} />);

      const cherry = screen.getByRole('radio', { name: 'Cherry' });
      cherry.focus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('radio', { name: 'Banana' })).toHaveFocus();
    });

    it('ArrowDown wraps from last to first', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup defaultValue="cherry" onChange={handleChange} />);

      const cherry = screen.getByRole('radio', { name: 'Cherry' });
      cherry.focus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('radio', { name: 'Apple' })).toHaveFocus();
      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    it('ArrowUp wraps from first to last', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup defaultValue="apple" onChange={handleChange} />);

      const apple = screen.getByRole('radio', { name: 'Apple' });
      apple.focus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('radio', { name: 'Cherry' })).toHaveFocus();
      expect(handleChange).toHaveBeenCalledWith('cherry');
    });

    it('can Tab into the group', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Before</button>
          <DefaultGroup />
          <button>After</button>
        </div>
      );
      await user.tab();
      // Should focus the "before" button first
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      await user.tab();
      // Should focus into the radio group (first radio with tabIndex=0)
      expect(screen.getByRole('radio', { name: 'Apple' })).toHaveFocus();
    });

    it('Space selects focused radio', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<DefaultGroup onChange={handleChange} />);

      const apple = screen.getByRole('radio', { name: 'Apple' });
      apple.focus();
      await user.keyboard('[Space]');
      expect(handleChange).toHaveBeenCalledWith('apple');
    });
  });

  describe('Disabled states', () => {
    it('disables all radios when group is disabled', () => {
      render(<DefaultGroup disabled />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('disables individual radio', () => {
      render(
        <RadioGroup legend="Choice">
          <Radio value="a" label="Option A" />
          <Radio value="b" label="Option B" disabled />
        </RadioGroup>
      );
      expect(screen.getByRole('radio', { name: 'Option A' })).not.toBeDisabled();
      expect(screen.getByRole('radio', { name: 'Option B' })).toBeDisabled();
    });
  });

  describe('Controlled component', () => {
    it('updates selection when controlled value changes', () => {
      const Controlled = () => {
        const [val, setVal] = useState('apple');
        return (
          <div>
            <DefaultGroup value={val} onChange={setVal} />
            <button onClick={() => setVal('cherry')}>Select Cherry</button>
          </div>
        );
      };
      const user = userEvent.setup();
      render(<Controlled />);

      expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();
      userEvent.click(screen.getByRole('button', { name: 'Select Cherry' }));
    });
  });

  describe('Accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<DefaultGroup />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (with selection)', async () => {
      const { container } = render(<DefaultGroup defaultValue="apple" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (disabled)', async () => {
      const { container } = render(<DefaultGroup disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (with error)', async () => {
      const { container } = render(
        <RadioGroup legend="Size" error="Please select a size">
          <Radio value="s" label="Small" />
          <Radio value="m" label="Medium" />
          <Radio value="l" label="Large" />
        </RadioGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (horizontal)', async () => {
      const { container } = render(
        <RadioGroup legend="Alignment" orientation="horizontal">
          <Radio value="left" label="Left" />
          <Radio value="center" label="Center" />
          <Radio value="right" label="Right" />
        </RadioGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('radiogroup is labelled by legend', () => {
      render(<DefaultGroup />);
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAccessibleName('Favorite fruit');
    });
  });
});