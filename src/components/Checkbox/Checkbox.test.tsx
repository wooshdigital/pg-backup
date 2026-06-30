import React, { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

expect.extend(toHaveNoViolations);

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders a native checkbox input', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
    });

    it('renders unchecked by default', () => {
      render(<Checkbox label="Accept" />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders checked when defaultChecked is set', () => {
      render(<Checkbox label="Accept" defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders controlled checked state', () => {
      render(<Checkbox label="Accept" checked onChange={() => {}} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders disabled state', () => {
      render(<Checkbox label="Disabled" disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('renders error message', () => {
      render(<Checkbox label="Accept" error="This field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('renders description', () => {
      render(<Checkbox label="Accept" description="You must accept the terms" />);
      expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
    });
  });

  describe('Indeterminate state', () => {
    it('sets indeterminate property on the input element', () => {
      const TestComponent = () => {
        const ref = useRef<HTMLInputElement>(null);
        return <Checkbox ref={ref} label="Select all" indeterminate />;
      };
      render(<TestComponent />);
      const input = screen.getByRole('checkbox') as HTMLInputElement;
      expect(input.indeterminate).toBe(true);
    });

    it('clears indeterminate when prop changes to false', () => {
      const { rerender } = render(<Checkbox label="Select all" indeterminate />);
      const input = screen.getByRole('checkbox') as HTMLInputElement;
      expect(input.indeterminate).toBe(true);

      rerender(<Checkbox label="Select all" indeterminate={false} />);
      expect(input.indeterminate).toBe(false);
    });
  });

  describe('Keyboard interaction', () => {
    it('toggles when Space is pressed', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Checkbox label="Toggle me" onChange={onChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalled();
    });

    it('can be focused via Tab', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Before</button>
          <Checkbox label="My checkbox" />
        </div>,
      );

      await user.tab();
      await user.tab();
      expect(screen.getByRole('checkbox')).toHaveFocus();
    });
  });

  describe('Click interaction', () => {
    it('calls onChange when clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Checkbox label="Click me" onChange={onChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('clicking label toggles checkbox', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Checkbox label="Click me" onChange={onChange} />);

      await user.click(screen.getByText('Click me'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Checkbox label="Disabled" disabled onChange={onChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-invalid when error is present', () => {
      render(<Checkbox label="Accept" error="Required" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error with aria-describedby', () => {
      render(<Checkbox label="Accept" error="Required" />);
      const checkbox = screen.getByRole('checkbox');
      const errorId = checkbox.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      const errorEl = document.getElementById(errorId!);
      expect(errorEl).toHaveTextContent('Required');
    });
  });

  describe('Accessibility', () => {
    it('has no axe violations in default state', async () => {
      const { container } = render(<Checkbox label="Accept terms" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when checked', async () => {
      const { container } = render(
        <Checkbox label="Accept terms" checked onChange={() => {}} />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when disabled', async () => {
      const { container } = render(<Checkbox label="Accept terms" disabled />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with error', async () => {
      const { container } = render(
        <Checkbox label="Accept terms" error="This is required" />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

describe('CheckboxGroup', () => {
  const renderGroup = (props = {}) =>
    render(
      <CheckboxGroup legend="Preferences" {...props}>
        <Checkbox label="Option A" name="prefs" value="a" />
        <Checkbox label="Option B" name="prefs" value="b" />
        <Checkbox label="Option C" name="prefs" value="c" />
      </CheckboxGroup>,
    );

  it('renders a fieldset with legend', () => {
    renderGroup();
    expect(screen.getByRole('group', { name: 'Preferences' })).toBeInTheDocument();
  });

  it('renders all checkbox options', () => {
    renderGroup();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('shows required indicator when required', () => {
    renderGroup({ required: true });
    expect(screen.getByRole('group')).toHaveAttribute('aria-required', 'true');
  });

  it('displays error message', () => {
    renderGroup({ error: 'Select at least one option' });
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one option');
  });

  it('displays helper text', () => {
    renderGroup({ helperText: 'Select all that apply' });
    expect(screen.getByText('Select all that apply')).toBeInTheDocument();
  });

  it('disables all checkboxes when group is disabled', () => {
    renderGroup({ disabled: true });
    screen.getAllByRole('checkbox').forEach((cb) => {
      expect(cb).toBeDisabled();
    });
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CheckboxGroup legend="Preferences">
        <Checkbox label="Option A" name="prefs" value="a" />
        <Checkbox label="Option B" name="prefs" value="b" />
      </CheckboxGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});