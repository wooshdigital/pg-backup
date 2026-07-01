import React, { useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Select } from './Select';
import type { SelectOption } from './SelectContext';

expect.extend(toHaveNoViolations);

const BASIC_OPTIONS: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry', disabled: true },
];

const renderSelect = (props: Partial<React.ComponentProps<typeof Select>> = {}) => {
  return render(
    <Select
      options={BASIC_OPTIONS}
      aria-label="Fruit"
      placeholder="Select a fruit"
      {...props}
    />
  );
};

describe('Select – rendering', () => {
  it('renders a combobox trigger button', () => {
    renderSelect();
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
  });

  it('shows placeholder when no value selected', () => {
    renderSelect();
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
  });

  it('shows selected label when defaultValue is set', () => {
    renderSelect({ defaultValue: 'banana' });
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('shows multiple selected labels when multiple + defaultValue', () => {
    renderSelect({ multiple: true, defaultValue: ['apple', 'cherry'] });
    expect(screen.getByText('Apple, Cherry')).toBeInTheDocument();
  });

  it('has aria-expanded=false when closed', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('applies aria-invalid when error prop is set', () => {
    renderSelect({ error: true });
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('disables the button when disabled prop is set', () => {
    renderSelect({ disabled: true });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('Select – opening/closing', () => {
  it('opens listbox on click', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes listbox on second click', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens on Enter key', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on Space key', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on ArrowDown key', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on ArrowUp key', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('returns focus to trigger after Escape', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('closes on outside click', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // Click outside
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('Select – option selection', () => {
  it('renders all options in listbox', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByRole('option')).toHaveLength(
      BASIC_OPTIONS.length
    );
  });

  it('selects option on click and closes listbox', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: /apple/i }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('marks selected option with aria-selected=true', async () => {
    renderSelect({ defaultValue: 'banana' });
    await userEvent.click(screen.getByRole('combobox'));
    const bananaOption = screen.getByRole('option', { name: /banana/i });
    expect(bananaOption).toHaveAttribute('aria-selected', 'true');
  });

  it('marks unselected options with aria-selected=false', async () => {
    renderSelect({ defaultValue: 'banana' });
    await userEvent.click(screen.getByRole('combobox'));
    const appleOption = screen.getByRole('option', { name: /apple/i });
    expect(appleOption).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the selected value', async () => {
    const onChange = vi.fn();
    renderSelect({ onChange });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: /cherry/i }));
    expect(onChange).toHaveBeenCalledWith('cherry');
  });

  it('does not select disabled options on click', async () => {
    const onChange = vi.fn();
    renderSelect({ onChange });
    await userEvent.click(screen.getByRole('combobox'));
    const elderberry = screen.getByRole('option', { name: /elderberry/i });
    expect(elderberry).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(elderberry);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Select – keyboard navigation', () => {
  it('navigates options with ArrowDown', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    // Listbox should be open and first enabled option active
    const listbox = screen.getByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    expect(activeId).not.toBeNull();
  });

  it('navigates options with ArrowUp', async () => {
    renderSelect({ defaultValue: 'banana' });
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const listboxAfterDown = screen.getByRole('listbox');
    const activeIdBefore = listboxAfterDown.getAttribute('aria-activedescendant');

    await userEvent.keyboard('{ArrowUp}');
    const listboxAfterUp = screen.getByRole('listbox');
    const activeIdAfter = listboxAfterUp.getAttribute('aria-activedescendant');
    // After ArrowUp, the active descendant should change
    expect(activeIdAfter).not.toEqual(activeIdBefore);
  });

  it('selects option with Enter key while navigating', async () => {
    const onChange = vi.fn();
    renderSelect({ onChange });
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('selects option with Space key while navigating', async () => {
    const onChange = vi.fn();
    renderSelect({ onChange });
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('jumps to first option with Home key', async () => {
    renderSelect({ defaultValue: 'cherry' });
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Home}');
    const listbox = screen.getByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    expect(activeId).toContain('-0');
  });

  it('jumps to last enabled option with End key', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{End}');
    // Last enabled option index should not be elderberry (disabled, index 4)
    // so it should be index 3 (date)
    const listbox = screen.getByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    expect(activeId).toContain('-3');
  });

  it('does not activate disabled options during keyboard nav', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    // Open and go to last option (Date, index 3 since Elderberry is disabled)
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{End}');
    const listbox = screen.getByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    // Should be on 'date' (index 3), not 'elderberry' (disabled, index 4)
    expect(activeId).toContain('-3');
  });
});

describe('Select – typeahead', () => {
  it('activates option starting with typed character', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('c');
    const listbox = screen.getByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    // 'c' should match Cherry (index 2)
    expect(activeId).toContain('-2');
  });

  it('activates option starting with typed multi-char sequence', async () => {
    const options: SelectOption[] = [
      { value: 'ba', label: 'Banana' },
      { value: 'bl', label: 'Blueberry' },
      { value: 'br', label: 'Breadfruit' },
    ];
    render(<Select options={options} aria-label="Fruit" />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('bl');
    const listbox = screen.getByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    expect(activeId).toContain('-1');
  });
});

describe('Select – multiple', () => {
  it('keeps listbox open after selecting in multiple mode', async () => {
    renderSelect({ multiple: true });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: /apple/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('toggles selection in multiple mode', async () => {
    const onChange = vi.fn();
    renderSelect({ multiple: true, onChange });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: /apple/i }));
    expect(onChange).toHaveBeenCalledWith(['apple']);
    await userEvent.click(screen.getByRole('option', { name: /banana/i }));
    expect(onChange).toHaveBeenCalledWith(['apple', 'banana']);
    // Deselect apple
    await userEvent.click(screen.getByRole('option', { name: /apple/i }));
    expect(onChange).toHaveBeenCalledWith(['banana']);
  });

  it('sets aria-multiselectable on listbox', async () => {
    renderSelect({ multiple: true });
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-multiselectable',
      'true'
    );
  });
});

describe('Select – controlled', () => {
  it('reflects controlled value', () => {
    render(
      <Select
        options={BASIC_OPTIONS}
        aria-label="Fruit"
        value="cherry"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('calls onChange but does not self-update (controlled)', async () => {
    const onChange = vi.fn();
    render(
      <Select
        options={BASIC_OPTIONS}
        aria-label="Fruit"
        value="cherry"
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: /apple/i }));
    expect(onChange).toHaveBeenCalledWith('apple');
    // Value display should still show Cherry (controlled)
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });
});

describe('Select – searchable', () => {
  it('renders search input when searchable=true', async () => {
    renderSelect({ searchable: true });
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('filters options based on search input', async () => {
    renderSelect({ searchable: true });
    await userEvent.click(screen.getByRole('combobox'));
    const searchInput = screen.getByRole('textbox');
    await userEvent.type(searchInput, 'ch');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Cherry');
  });

  it('shows empty state when no options match search', async () => {
    renderSelect({ searchable: true });
    await userEvent.click(screen.getByRole('combobox'));
    const searchInput = screen.getByRole('textbox');
    await userEvent.type(searchInput, 'zzz');
    expect(screen.getByText('No options found')).toBeInTheDocument();
  });
});

describe('Select – accessibility', () => {
  it('trigger has aria-haspopup=listbox', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-haspopup',
      'listbox'
    );
  });

  it('trigger has aria-controls pointing to listbox when open', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));
    const trigger = screen.getByRole('combobox');
    const listbox = screen.getByRole('listbox');
    expect(trigger.getAttribute('aria-controls')).toBe(
      listbox.closest('[role="presentation"]')?.id
    );
  });

  it('aria-activedescendant updates as user navigates', async () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const listbox = screen.getByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    expect(activeId).not.toBeNull();
    expect(activeId).not.toBe('');
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(
      <>
        <label id="sel-label">Fruit</label>
        <Select
          options={BASIC_OPTIONS}
          aria-labelledby="sel-label"
          placeholder="Select a fruit"
        />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when open', async () => {
    const { container } = render(
      <>
        <label id="sel-label">Fruit</label>
        <Select
          options={BASIC_OPTIONS}
          aria-labelledby="sel-label"
          placeholder="Select a fruit"
        />
      </>
    );
    await userEvent.click(screen.getByRole('combobox'));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in multiple mode', async () => {
    const { container } = render(
      <>
        <label id="sel-label-multi">Fruits</label>
        <Select
          options={BASIC_OPTIONS}
          aria-labelledby="sel-label-multi"
          multiple
          placeholder="Select fruits"
        />
      </>
    );
    await userEvent.click(screen.getByRole('combobox'));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in disabled state', async () => {
    const { container } = render(
      <>
        <label id="sel-label-dis">Fruit</label>
        <Select
          options={BASIC_OPTIONS}
          aria-labelledby="sel-label-dis"
          disabled
        />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});