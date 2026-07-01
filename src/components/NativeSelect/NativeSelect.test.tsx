import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NativeSelect } from './NativeSelect';

describe('NativeSelect', () => {
  it('renders a select element', () => {
    render(
      <NativeSelect aria-label="Choose option">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </NativeSelect>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(
      <NativeSelect label="Fruit">
        <option value="apple">Apple</option>
      </NativeSelect>
    );
    expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
  });

  it('associates label with select via htmlFor', () => {
    render(
      <NativeSelect label="Color" id="color-select">
        <option value="red">Red</option>
      </NativeSelect>
    );
    const select = screen.getByRole('combobox', { name: 'Color' });
    expect(select).toHaveAttribute('id', 'color-select');
  });

  it('shows error message and sets aria-invalid', () => {
    render(
      <NativeSelect label="Size" error="Please select a size">
        <option value="">Select...</option>
        <option value="s">Small</option>
      </NativeSelect>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a size');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows helper text', () => {
    render(
      <NativeSelect label="Country" helperText="Select your country of residence">
        <option value="us">US</option>
      </NativeSelect>
    );
    expect(screen.getByText('Select your country of residence')).toBeInTheDocument();
  });

  it('links select to helper text via aria-describedby', () => {
    render(
      <NativeSelect label="Language" id="lang" helperText="Choose preferred language">
        <option value="en">English</option>
      </NativeSelect>
    );
    const select = screen.getByRole('combobox');
    const describedBy = select.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const helperEl = document.getElementById(describedBy!);
    expect(helperEl).toHaveTextContent('Choose preferred language');
  });

  it('links select to error message via aria-describedby when error present', () => {
    render(
      <NativeSelect label="Size" id="size" error="Required">
        <option value="">Pick one</option>
      </NativeSelect>
    );
    const select = screen.getByRole('combobox');
    const describedBy = select.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy!.split(' ')[0]);
    expect(errorEl).toHaveTextContent('Required');
  });

  it('is disabled when disabled prop is passed', () => {
    render(
      <NativeSelect label="Option" disabled>
        <option value="a">A</option>
      </NativeSelect>
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NativeSelect label="Fruit" onChange={onChange}>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </NativeSelect>
    );
    await user.selectOptions(screen.getByRole('combobox'), 'banana');
    expect(onChange).toHaveBeenCalled();
  });

  it('supports multiple selection', () => {
    render(
      <NativeSelect label="Tags" multiple>
        <option value="a">A</option>
        <option value="b">B</option>
      </NativeSelect>
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('does not show helper text when error is shown', () => {
    render(
      <NativeSelect label="Field" error="Error!" helperText="Helper text">
        <option value="a">A</option>
      </NativeSelect>
    );
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });
});