import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { NativeSelect } from './NativeSelect';

expect.extend(toHaveNoViolations);

describe('NativeSelect', () => {
  const defaultOptions = (
    <>
      <option value="">Select an option</option>
      <option value="a">Option A</option>
      <option value="b">Option B</option>
      <option value="c">Option C</option>
    </>
  );

  it('renders a native select element', () => {
    render(
      <NativeSelect aria-label="Test select">{defaultOptions}</NativeSelect>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders children as options', () => {
    render(
      <NativeSelect aria-label="Test select">{defaultOptions}</NativeSelect>
    );
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  it('applies aria-label correctly', () => {
    render(
      <NativeSelect aria-label="My Select">{defaultOptions}</NativeSelect>
    );
    expect(screen.getByRole('combobox', { name: 'My Select' })).toBeInTheDocument();
  });

  it('applies aria-labelledby correctly', () => {
    render(
      <>
        <label id="label-id">Choose option</label>
        <NativeSelect aria-labelledby="label-id">{defaultOptions}</NativeSelect>
      </>
    );
    expect(
      screen.getByRole('combobox', { name: 'Choose option' })
    ).toBeInTheDocument();
  });

  it('sets aria-invalid when error prop is true', () => {
    render(
      <NativeSelect aria-label="Test" error>
        {defaultOptions}
      </NativeSelect>
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when error is false', () => {
    render(
      <NativeSelect aria-label="Test">{defaultOptions}</NativeSelect>
    );
    const select = screen.getByRole('combobox');
    expect(select).not.toHaveAttribute('aria-invalid');
  });

  it('respects explicit aria-invalid override', () => {
    render(
      <NativeSelect aria-label="Test" aria-invalid="true">
        {defaultOptions}
      </NativeSelect>
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the select when disabled prop is passed', () => {
    render(
      <NativeSelect aria-label="Test" disabled>
        {defaultOptions}
      </NativeSelect>
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('calls onChange handler when value changes', () => {
    const onChange = vi.fn();
    render(
      <NativeSelect aria-label="Test" onChange={onChange}>
        {defaultOptions}
      </NativeSelect>
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'a' },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports multiple selection', () => {
    render(
      <NativeSelect aria-label="Test" multiple>
        {defaultOptions}
      </NativeSelect>
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('passes additional HTML attributes to the select element', () => {
    render(
      <NativeSelect aria-label="Test" data-testid="my-select" id="my-id">
        {defaultOptions}
      </NativeSelect>
    );
    expect(screen.getByTestId('my-select')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-id');
  });

  it('applies aria-describedby', () => {
    render(
      <>
        <span id="hint">Choose wisely</span>
        <NativeSelect aria-label="Test" aria-describedby="hint">
          {defaultOptions}
        </NativeSelect>
      </>
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-describedby',
      'hint'
    );
  });

  it('has no accessibility violations in default state', async () => {
    const { container } = render(
      <>
        <label htmlFor="native-sel">Pick one</label>
        <NativeSelect id="native-sel">{defaultOptions}</NativeSelect>
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in error state', async () => {
    const { container } = render(
      <>
        <label htmlFor="native-sel-err">Pick one</label>
        <NativeSelect id="native-sel-err" error aria-describedby="err-msg">
          {defaultOptions}
        </NativeSelect>
        <span id="err-msg">This field is required</span>
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in disabled state', async () => {
    const { container } = render(
      <>
        <label htmlFor="native-sel-dis">Pick one</label>
        <NativeSelect id="native-sel-dis" disabled>
          {defaultOptions}
        </NativeSelect>
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});