import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { NativeSelect } from './NativeSelect';

expect.extend(toHaveNoViolations);

const defaultOptions = (
  <>
    <option value="">Choose an option</option>
    <option value="a">Option A</option>
    <option value="b">Option B</option>
    <option value="c">Option C</option>
  </>
);

describe('NativeSelect', () => {
  it('renders a select element', () => {
    render(<NativeSelect>{defaultOptions}</NativeSelect>);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with label and associates it', () => {
    render(<NativeSelect label="Choose option">{defaultOptions}</NativeSelect>);
    expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<NativeSelect>{defaultOptions}</NativeSelect>);
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <NativeSelect onChange={handleChange}>{defaultOptions}</NativeSelect>
    );
    await user.selectOptions(screen.getByRole('combobox'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('sets aria-invalid when error is provided', () => {
    render(
      <NativeSelect error="This field is required">{defaultOptions}</NativeSelect>
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows error message and associates via aria-describedby', () => {
    render(
      <NativeSelect error="This field is required">{defaultOptions}</NativeSelect>
    );
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('This field is required');
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-describedby', expect.stringContaining(errorMsg.id));
  });

  it('shows helper text when no error', () => {
    render(
      <NativeSelect helperText="Pick one">{defaultOptions}</NativeSelect>
    );
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('does not show helper text when there is an error', () => {
    render(
      <NativeSelect error="Error!" helperText="Pick one">
        {defaultOptions}
      </NativeSelect>
    );
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<NativeSelect disabled>{defaultOptions}</NativeSelect>);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('uses provided id', () => {
    render(<NativeSelect id="my-select">{defaultOptions}</NativeSelect>);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-select');
  });

  it('supports multiple selection', () => {
    render(<NativeSelect multiple>{defaultOptions}</NativeSelect>);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(
      <NativeSelect label="Choose option" id="axe-select">
        {defaultOptions}
      </NativeSelect>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe accessibility checks with error', async () => {
    const { container } = render(
      <NativeSelect label="Choose option" id="axe-select-err" error="Required">
        {defaultOptions}
      </NativeSelect>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});