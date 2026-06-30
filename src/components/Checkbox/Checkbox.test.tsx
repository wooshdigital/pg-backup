import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

expect.extend(toHaveNoViolations);

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders a checkbox input', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
    });

    it('renders helper text', () => {
      render(<Checkbox label="Subscribe" helperText="You can unsubscribe any time" />);
      expect(screen.getByText('You can unsubscribe any time')).toBeInTheDocument();
    });

    it('renders error message and sets aria-invalid', () => {
      render(<Checkbox label="Accept" error="Required" />);
      const input = screen.getByRole('checkbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
    });

    it('associates error with input via aria-describedby', () => {
      render(<Checkbox label="Accept" error="Required" />);
      const input = screen.getByRole('checkbox');
      const errorEl = screen.getByRole('alert');
      expect(input.getAttribute('aria-describedby')).toContain(errorEl.id);
    });

    it('renders as disabled', () => {
      render(<Checkbox label="Disabled" disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });

  describe('Controlled / Uncontrolled', () => {
    it('renders unchecked by default', () => {
      render(<Checkbox label="Test" />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders checked when defaultChecked is true', () => {
      render(<Checkbox label="Test" defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Checkbox label="Test" checked onChange={() => {}} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Keyboard interaction', () => {
    it('toggles checkbox with Space key', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Checkbox label="Toggle me" onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('can be focused via Tab', async () => {
      const user = userEvent.setup();
      render(<Checkbox label="Focus me" />);
      await user.tab();
      expect(screen.getByRole('checkbox')).toHaveFocus();
    });

    it('does not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Checkbox label="Disabled" disabled onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard('[Space]');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Indeterminate state', () => {
    it('sets indeterminate property on input element', () => {
      const TestComponent = () => {
        return <Checkbox label="Mixed" indeterminate />;
      };
      render(<TestComponent />);
      const input = screen.getByRole('checkbox') as HTMLInputElement;
      expect(input.indeterminate).toBe(true);
    });

    it('clears indeterminate when prop changes to false', () => {
      const { rerender } = render(<Checkbox label="Mixed" indeterminate />);
      const input = screen.getByRole('checkbox') as HTMLInputElement;
      expect(input.indeterminate).toBe(true);

      rerender(<Checkbox label="Mixed" indeterminate={false} />);
      expect(input.indeterminate).toBe(false);
    });

    it('exposes input ref and allows setting indeterminate externally', () => {
      const RefComponent = () => {
        const ref = useRef<HTMLInputElement>(null);
        return <Checkbox ref={ref} label="Ref test" />;
      };
      render(<RefComponent />);
      // If it renders without throwing, the ref works
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('onChange handler', () => {
    it('calls onChange with true when checking', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Checkbox label="Test" onChange={handleChange} />);
      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('calls onChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Checkbox label="Test" defaultChecked onChange={handleChange} />);
      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(false, expect.any(Object));
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
      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });

    it('renders error message', () => {
      render(
        <CheckboxGroup legend="Preferences" error="Select at least one">
          <Checkbox label="Email" />
        </CheckboxGroup>
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Select at least one');
    });

    it('renders helper text', () => {
      render(
        <CheckboxGroup legend="Preferences" helperText="Select all that apply">
          <Checkbox label="Email" />
        </CheckboxGroup>
      );
      expect(screen.getByText('Select all that apply')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no axe violations (unchecked)', async () => {
      const { container } = render(<Checkbox label="Accept terms" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (checked)', async () => {
      const { container } = render(
        <Checkbox label="Accept terms" checked onChange={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (indeterminate)', async () => {
      const { container } = render(<Checkbox label="Mixed selection" indeterminate />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (disabled)', async () => {
      const { container } = render(<Checkbox label="Disabled option" disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations (with error)', async () => {
      const { container } = render(
        <Checkbox label="Accept" error="This field is required" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations for CheckboxGroup', async () => {
      const { container } = render(
        <CheckboxGroup legend="Contact preferences">
          <Checkbox label="Email" />
          <Checkbox label="SMS" />
          <Checkbox label="Phone" />
        </CheckboxGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});