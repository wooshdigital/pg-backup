import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';
import type { SelectOption } from './SelectContext';

const defaultOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry', disabled: true },
];

function renderSelect(props: Partial<React.ComponentProps<typeof Select>> = {}) {
  return render(
    <Select
      options={defaultOptions}
      placeholder="Pick a fruit..."
      label="Fruit"
      {...props}
    />
  );
}

describe('Select', () => {
  describe('Rendering', () => {
    it('renders a combobox trigger', () => {
      renderSelect();
      expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
    });

    it('shows placeholder when no value selected', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit...');
    });

    it('shows selected value label', () => {
      renderSelect({ value: 'banana' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });

    it('listbox is not visible initially', () => {
      renderSelect();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders label associated with combobox', () => {
      renderSelect();
      expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
    });

    it('shows error message', () => {
      renderSelect({ error: 'This field is required' });
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('sets aria-invalid when error is present', () => {
      renderSelect({ error: 'Required' });
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows helper text', () => {
      renderSelect({ helperText: 'Choose your favourite' });
      expect(screen.getByText('Choose your favourite')).toBeInTheDocument();
    });
  });

  describe('Open/Close Behavior', () => {
    it('opens listbox on click', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes listbox on second click', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.click(trigger);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('aria-expanded is false when closed', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('aria-expanded is true when open', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('returns focus to trigger on close via Escape', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.keyboard('{Escape}');
      expect(trigger).toHaveFocus();
    });

    it('does not open when disabled', async () => {
      const user = userEvent.setup();
      renderSelect({ disabled: true });
      await user.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
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

    it('opens with ArrowDown and focuses first option', async () => {
      const user = userEvent.setup();
      renderSelect();
      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      const trigger = screen.getByRole('combobox');
      const activeDescendant = trigger.getAttribute('aria-activedescendant');
      expect(activeDescendant).toBeTruthy();
    });

    it('navigates down through options with ArrowDown', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      const firstDescendant = trigger.getAttribute('aria-activedescendant');
      await user.keyboard('{ArrowDown}');
      const secondDescendant = trigger.getAttribute('aria-activedescendant');
      expect(firstDescendant).not.toBe(secondDescendant);
    });

    it('navigates up through options with ArrowUp', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      const afterTwoDown = trigger.getAttribute('aria-activedescendant');
      await user.keyboard('{ArrowUp}');
      const afterUp = trigger.getAttribute('aria-activedescendant');
      expect(afterTwoDown).not.toBe(afterUp);
    });

    it('selects option on Enter when open', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect({ onChange });
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith('apple');
    });

    it('closes and selects on Enter', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('navigates to first option with Home', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Home}');
      // Should be back at first index
      const activeDescendant = trigger.getAttribute('aria-activedescendant');
      expect(activeDescendant).toContain('option-0');
    });

    it('navigates to last option with End', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{End}');
      const activeDescendant = trigger.getAttribute('aria-activedescendant');
      // Last enabled option (elderberry is disabled, so index 3 = Date)
      expect(activeDescendant).toContain('option-3');
    });
  });

  describe('Typeahead', () => {
    it('types to jump to matching option', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('c');
      const activeDescendant = trigger.getAttribute('aria-activedescendant');
      // Cherry starts with 'c', index 2
      expect(activeDescendant).toContain('option-2');
    });
  });

  describe('Option Selection', () => {
    it('selects option on click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect({ onChange });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      await user.click(options[1]); // Banana
      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('updates display value after selection', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      await user.click(options[0]); // Apple
      expect(screen.getByRole('combobox')).toHaveTextContent('Apple');
    });

    it('marks selected option with aria-selected=true', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'cherry' });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      const cherry = options.find((o) => o.textContent?.includes('Cherry'));
      expect(cherry).toHaveAttribute('aria-selected', 'true');
    });

    it('marks non-selected options with aria-selected=false', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'cherry' });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      const apple = options.find((o) => o.textContent?.includes('Apple'));
      expect(apple).toHaveAttribute('aria-selected', 'false');
    });

    it('marks disabled option with aria-disabled=true', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      const elderberry = options.find((o) => o.textContent?.includes('Elderberry'));
      expect(elderberry).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not select disabled option on click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect({ onChange });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      const elderberry = options.find((o) => o.textContent?.includes('Elderberry'))!;
      // Disabled options have pointer-events: none in CSS so click shouldn't fire
      // but even if it does, the handler checks disabled
      await user.click(elderberry);
      expect(onChange).not.toHaveBeenCalledWith('elderberry');
    });
  });

  describe('Multiple Selection', () => {
    it('supports multiple selection', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect({ multiple: true, onChange });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      await user.click(options[0]); // Apple
      await user.click(options[1]); // Banana
      expect(onChange).toHaveBeenLastCalledWith(['apple', 'banana']);
    });

    it('deselects already-selected option in multiple mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect({ multiple: true, value: ['apple', 'banana'], onChange });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      await user.click(options[0]); // Deselect Apple
      expect(onChange).toHaveBeenCalledWith(['banana']);
    });

    it('keeps listbox open after selection in multiple mode', async () => {
      const user = userEvent.setup();
      renderSelect({ multiple: true });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      await user.click(options[0]);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('renders aria-multiselectable on listbox', async () => {
      const user = userEvent.setup();
      renderSelect({ multiple: true });
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  describe('ARIA', () => {
    it('sets aria-controls pointing to listbox id', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      const controlsId = trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      expect(document.getElementById(controlsId!)).toHaveAttribute('role', 'listbox');
    });

    it('tracks aria-activedescendant as user navigates', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      expect(trigger.getAttribute('aria-activedescendant')).toBeTruthy();
    });

    it('clears aria-activedescendant when closed', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Escape}');
      expect(trigger.getAttribute('aria-activedescendant')).toBeFalsy();
    });
  });

  describe('Controlled Mode', () => {
    it('respects controlled value', () => {
      renderSelect({ value: 'cherry' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Cherry');
    });

    it('calls onChange with new value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect({ value: 'apple', onChange });
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      await user.click(options[1]); // Banana
      expect(onChange).toHaveBeenCalledWith('banana');
    });
  });
});