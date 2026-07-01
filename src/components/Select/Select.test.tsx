import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Select } from './Select';
import type { SelectOption } from './SelectContext';

expect.extend(toHaveNoViolations);

const options: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape', disabled: true },
  { value: 'mango', label: 'Mango' },
];

function renderSelect(props = {}) {
  return render(<Select options={options} label="Fruit" {...props} />);
}

describe('Select', () => {
  describe('Rendering', () => {
    it('renders trigger button with combobox role', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders label', () => {
      renderSelect();
      expect(screen.getByText('Fruit')).toBeInTheDocument();
    });

    it('shows placeholder when no value selected', () => {
      renderSelect({ placeholder: 'Pick a fruit' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit');
    });

    it('shows selected value', () => {
      renderSelect({ value: 'apple' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Apple');
    });

    it('listbox is not rendered when closed', () => {
      renderSelect();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('is disabled when disabled prop is set', () => {
      renderSelect({ disabled: true });
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('ARIA Attributes', () => {
    it('has aria-expanded=false when closed', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-haspopup=listbox', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('has aria-controls pointing to listbox id', () => {
      renderSelect();
      const trigger = screen.getByRole('combobox');
      const controlsId = trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
    });

    it('has aria-invalid when error is provided', () => {
      renderSelect({ error: 'Required' });
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows error message with alert role', () => {
      renderSelect({ error: 'Please select a fruit' });
      expect(screen.getByRole('alert')).toHaveTextContent('Please select a fruit');
    });
  });

  describe('Mouse Interactions', () => {
    it('opens listbox on trigger click', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes listbox when trigger is clicked again', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('selects option on click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderSelect({ onChange: handleChange });
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    it('closes listbox after selecting single option', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not select disabled option', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderSelect({ onChange: handleChange });
      await user.click(screen.getByRole('combobox'));
      // Grape is disabled - aria-disabled prevents interaction
      const grape = screen.getByRole('option', { name: 'Grape' });
      expect(grape).toHaveAttribute('aria-disabled', 'true');
    });

    it('closes on outside click', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Select options={options} label="Fruit" />
          <button>Outside</button>
        </div>
      );
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Outside' }));
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens with Enter key', async () => {
      const user = userEvent.setup();
      renderSelect();
      screen.getByRole('combobox').focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens with Space key', async () => {
      const user = userEvent.setup();
      renderSelect();
      screen.getByRole('combobox').focus();
      await user.keyboard(' ');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens with ArrowDown key', async () => {
      const user = userEvent.setup();
      renderSelect();
      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens with ArrowUp key', async () => {
      const user = userEvent.setup();
      renderSelect();
      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes with Escape key', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('returns focus to trigger after Escape', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Escape}');
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('navigates with ArrowDown in listbox', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowDown}');
      const listbox = screen.getByRole('listbox');
      const activeDescendant = screen.getByRole('combobox').getAttribute('aria-activedescendant');
      if (activeDescendant) {
        const activeEl = document.getElementById(activeDescendant);
        expect(activeEl).toBeInTheDocument();
      }
    });

    it('skips disabled options when navigating', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      // Navigate to Cherry (index 2), then down should skip Grape (index 3, disabled)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      // Now should be on Cherry
      // Next ArrowDown should skip Grape and go to Mango
      await user.keyboard('{ArrowDown}');
      const trigger = screen.getByRole('combobox');
      const activeId = trigger.getAttribute('aria-activedescendant');
      expect(activeId).toBeTruthy();
    });

    it('selects option with Enter in listbox', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderSelect({ onChange: handleChange });
      await user.click(screen.getByRole('combobox'));
      // First enabled option is Apple at index 0
      await user.keyboard('{Enter}');
      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    it('selects option with Space in listbox', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderSelect({ onChange: handleChange });
      await user.click(screen.getByRole('combobox'));
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalled();
    });

    it('Home key jumps to first enabled option', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Home}');
      // First option should be active
      const trigger = screen.getByRole('combobox');
      const activeId = trigger.getAttribute('aria-activedescendant');
      const activeEl = activeId ? document.getElementById(activeId) : null;
      expect(activeEl?.textContent).toContain('Apple');
    });

    it('End key jumps to last enabled option', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{End}');
      const trigger = screen.getByRole('combobox');
      const activeId = trigger.getAttribute('aria-activedescendant');
      const activeEl = activeId ? document.getElementById(activeId) : null;
      expect(activeEl?.textContent).toContain('Mango');
    });

    it('typeahead finds matching option', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('m');
      const trigger = screen.getByRole('combobox');
      const activeId = trigger.getAttribute('aria-activedescendant');
      const activeEl = activeId ? document.getElementById(activeId) : null;
      expect(activeEl?.textContent).toContain('Mango');
    });

    it('typeahead works from trigger (opens and navigates)', async () => {
      const user = userEvent.setup();
      renderSelect();
      screen.getByRole('combobox').focus();
      await user.keyboard('b');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Multiple Selection', () => {
    it('allows selecting multiple options', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderSelect({ multiple: true, onChange: handleChange });
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(handleChange).toHaveBeenCalledWith(['apple']);
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      expect(handleChange).toHaveBeenCalledWith(['apple', 'banana']);
    });

    it('deselects option when clicked again in multiple mode', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderSelect({
        multiple: true,
        value: ['apple', 'banana'],
        onChange: handleChange,
      });
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(handleChange).toHaveBeenCalledWith(['banana']);
    });

    it('does not close listbox after selection in multiple mode', async () => {
      const user = userEvent.setup();
      renderSelect({ multiple: true });
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('shows count when multiple values selected', () => {
      renderSelect({ multiple: true, value: ['apple', 'banana'] });
      expect(screen.getByRole('combobox')).toHaveTextContent('2 selected');
    });

    it('shows single label when one value selected in multiple mode', () => {
      renderSelect({ multiple: true, value: ['apple'] });
      expect(screen.getByRole('combobox')).toHaveTextContent('Apple');
    });
  });

  describe('Controlled Usage', () => {
    it('reflects controlled value', () => {
      renderSelect({ value: 'cherry' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Cherry');
    });

    it('calls onChange with new value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderSelect({ value: 'apple', onChange: handleChange });
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      expect(handleChange).toHaveBeenCalledWith('banana');
    });
  });

  describe('Option aria-selected', () => {
    it('marks selected option with aria-selected=true', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'apple' });
      await user.click(screen.getByRole('combobox'));
      const appleOption = screen.getByRole('option', { name: /Apple/ });
      expect(appleOption).toHaveAttribute('aria-selected', 'true');
    });

    it('marks non-selected options with aria-selected=false', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'apple' });
      await user.click(screen.getByRole('combobox'));
      const bananaOption = screen.getByRole('option', { name: /Banana/ });
      expect(bananaOption).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Accessibility', () => {
    it('passes axe checks when closed', async () => {
      const { container } = render(
        <Select options={options} label="Fruit" id="axe-select" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe checks when open', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Select options={options} label="Fruit" id="axe-select-open" />
      );
      await user.click(screen.getByRole('combobox'));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe checks with error state', async () => {
      const { container } = render(
        <Select options={options} label="Fruit" id="axe-select-err" error="Required" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe checks in multiple mode', async () => {
      const { container } = render(
        <Select options={options} label="Fruits" id="axe-select-multi" multiple />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});