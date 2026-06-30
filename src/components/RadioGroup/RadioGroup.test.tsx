import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';

expect.extend(toHaveNoViolations);

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const DefaultGroup = (props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) => (
  <RadioGroup legend="Favourite fruit" {...props}>
    {OPTIONS.map((opt) => (
      <Radio key={opt.value} value={opt.value} label={opt.label} />
    ))}
  </RadioGroup>
);

describe('RadioGroup', () => {
  describe('Rendering', () => {
    it('renders a radiogroup with correct legend', () => {
      render(<DefaultGroup />);
      expect(
        screen.getByRole('radiogroup', { name: 'Favourite fruit' }),
      ).toBeInTheDocument();
    });

    it('renders all radio options', () => {
      render(<DefaultGroup />);
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('renders radio labels', () => {
      render(<DefaultGroup />);
      OPTIONS.forEach(({ label }) => {
        expect(screen.getByRole('radio', { name: label })).toBeInTheDocument();
      });
    });

    it('renders with default value selected', () => {
      render(<DefaultGroup defaultValue="banana" />);
      expect(screen.getByRole('radio', { name: 'Banana' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
    });

    it('renders controlled value', () => {
      render(<DefaultGroup value="cherry" onChange={() => {}} />);
      expect(screen.getByRole('radio', { name: 'Cherry' })).toBeChecked();
    });

    it('renders error message', () => {
      render(<DefaultGroup error="Please select an option" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Please select an option');
    });

    it('renders helper text', () => {
      render(<DefaultGroup helperText="Pick your favourite" />);
      expect(screen.getByText('Pick your favourite')).toBeInTheDocument();
    });

    it('disables all radios when group is disabled', () => {
      render(<DefaultGroup disabled />);
      screen.getAllByRole('radio').forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });
  });

  describe('Name association', () => {
    it('all radios share the same name attribute', () => {
      render(<DefaultGroup />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const names = new Set(radios.map((r) => r.name));
      expect(names.size).toBe(1);
    });

    it('uses provided name prop', () => {
      render(<DefaultGroup name="fruit-picker" />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      radios.forEach((r) => expect(r.name).toBe('fruit-picker'));
    });
  });

  describe('Click interaction', () => {
    it('selects a radio when clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<DefaultGroup onChange={onChange} />);

      await user.click(screen.getByRole('radio', { name: 'Banana' }));
      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('clicking label selects radio', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<DefaultGroup onChange={onChange} />);

      await user.click(screen.getByText('Apple'));
      expect(onChange).toHaveBeenCalledWith('apple');
    });

    it('does not call onChange for disabled radio', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <RadioGroup legend="Fruits" onChange={onChange}>
          <Radio value="apple" label="Apple" />
          <Radio value="banana" label="Banana" disabled />
        </RadioGroup>,
      );

      await user.click(screen.getByRole('radio', { name: 'Banana' }));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard navigation (roving tabindex)', () => {
    it('ArrowDown moves focus to next radio', async () => {
      const user = userEvent.setup();
      render(<DefaultGroup defaultValue="apple" />);

      const appleRadio = screen.getByRole('radio', { name: 'Apple' });
      appleRadio.focus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('radio', { name: 'Banana' })).toHaveFocus();
    });

    it('ArrowUp moves focus to previous radio', async () => {
      const user = userEvent.setup();
      render(<DefaultGroup defaultValue="banana" />);

      const bananaRadio = screen.getByRole('radio', { name: 'Banana' });
      bananaRadio.focus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('radio', { name: 'Apple' })).toHaveFocus();
    });

    it('ArrowRight moves focus to next radio', async () => {
      const user = userEvent.setup();
      render(<DefaultGroup defaultValue="apple" />);

      const appleRadio = screen.getByRole('radio', { name: 'Apple' });
      appleRadio.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('radio', { name: 'Banana' })).toHaveFocus();
    });

    it('ArrowLeft moves focus to previous radio', async () => {
      const user = userEvent.setup();
      render(<DefaultGroup defaultValue="cherry" />);

      const cherryRadio = screen.getByRole('radio', { name: 'Cherry' });
      cherryRadio.focus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('radio', { name: 'Banana' })).toHaveFocus();
    });

    it('ArrowDown wraps from last to first', async () => {
      const user = userEvent.setup();
      render(<DefaultGroup defaultValue="cherry" />);

      const cherryRadio = screen.getByRole('radio', { name: 'Cherry' });
      cherryRadio.focus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('radio', { name: 'Apple' })).toHaveFocus();
    });

    it('ArrowUp wraps from first to last', async () => {
      const user = userEvent.setup();
      render(<DefaultGroup defaultValue="apple" />);

      const appleRadio = screen.getByRole('radio', { name: 'Apple' });
      appleRadio.focus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('radio', { name: 'Cherry' })).toHaveFocus();
    });

    it('Arrow keys select the focused radio', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<DefaultGroup defaultValue="apple" onChange={onChange} />);

      const appleRadio = screen.getByRole('radio', { name: 'Apple' });
      appleRadio.focus();

      await user.keyboard('{ArrowDown}');
      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('skips disabled radios on arrow key navigation', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup legend="Fruits" defaultValue="apple">
          <Radio value="apple" label="Apple" />
          <Radio value="banana" label="Banana" disabled />
          <Radio value="cherry" label="Cherry" />
        </RadioGroup>,
      );

      const appleRadio = screen.getByRole('radio', { name: 'Apple' });
      appleRadio.focus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('radio', { name: 'Cherry' })).toHaveFocus();
    });

    it('selected radio has tabIndex=0, others have tabIndex=-1', () => {
      render(<DefaultGroup value="banana" onChange={() => {}} />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const apple = screen.getByRole('radio', { name: 'Apple' }) as HTMLInputElement;
      const banana = screen.getByRole('radio', { name: 'Banana' }) as HTMLInputElement;
      const cherry = screen.getByRole('radio', { name: 'Cherry' }) as HTMLInputElement;

      expect(banana.tabIndex).toBe(0);
      expect(apple.tabIndex).toBe(-1);
      expect(cherry.tabIndex).toBe(-1);
    });
  });

  describe('Controlled usage', () => {
    it('updates selection when controlled value changes', () => {
      const { rerender } = render(<DefaultGroup value="apple" onChange={() => {}} />);
      expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();

      rerender(<DefaultGroup value="cherry" onChange={() => {}} />);
      expect(screen.getByRole('radio', { name: 'Cherry' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
    });

    it('works as a controlled component', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [value, setValue] = useState('apple');
        return (
          <RadioGroup legend="Pick one" value={value} onChange={setValue}>
            <Radio value="apple" label="Apple" />
            <Radio value="banana" label="Banana" />
            <Radio value="cherry" label="Cherry" />
          </RadioGroup>
        );
      };
      render(<Controlled />);

      await user.click(screen.getByRole('radio', { name: 'Cherry' }));
      expect(screen.getByRole('radio', { name: 'Cherry' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
    });
  });

  describe('Individual Radio disabled', () => {
    it('only disables specified radio, not others', () => {
      render(
        <RadioGroup legend="Fruits">
          <Radio value="apple" label="Apple" />
          <Radio value="banana" label="Banana" disabled />
          <Radio value="cherry" label="Cherry" />
        </RadioGroup>,
      );
      expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeDisabled();
      expect(screen.getByRole('radio', { name: 'Banana' })).toBeDisabled();
      expect(screen.getByRole('radio', { name: 'Cherry' })).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has no axe violations in default state', async () => {
      const { container } = render(<DefaultGroup />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with a selected value', async () => {
      const { container } = render(<DefaultGroup defaultValue="apple" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with error', async () => {
      const { container } = render(
        <DefaultGroup error="Please select one option" />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when disabled', async () => {
      const { container } = render(<DefaultGroup disabled />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with required', async () => {
      const { container } = render(<DefaultGroup required />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});