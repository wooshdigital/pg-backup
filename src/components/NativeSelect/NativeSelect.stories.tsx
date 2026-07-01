import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NativeSelect } from './NativeSelect';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

const countryOptions = (
  <>
    <option value="">Select a country</option>
    <option value="us">United States</option>
    <option value="gb">United Kingdom</option>
    <option value="ca">Canada</option>
    <option value="au">Australia</option>
    <option value="de">Germany</option>
    <option value="fr">France</option>
    <option value="jp">Japan</option>
  </>
);

export const Default: Story = {
  args: {
    label: 'Country',
  },
  render: (args) => <NativeSelect {...args}>{countryOptions}</NativeSelect>,
};

export const WithPlaceholder: Story = {
  render: () => (
    <NativeSelect label="Country">
      <option value="" disabled>
        Select a country...
      </option>
      <option value="us">United States</option>
      <option value="gb">United Kingdom</option>
      <option value="ca">Canada</option>
    </NativeSelect>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NativeSelect
          label="Country"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          {countryOptions}
        </NativeSelect>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: {value || '(none)'}
        </p>
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => (
    <NativeSelect label="Countries" multiple size={5} style={{ height: 'auto' }}>
      <option value="us">United States</option>
      <option value="gb">United Kingdom</option>
      <option value="ca">Canada</option>
      <option value="au">Australia</option>
      <option value="de">Germany</option>
    </NativeSelect>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    disabled: true,
  },
  render: (args) => <NativeSelect {...args}>{countryOptions}</NativeSelect>,
};

export const WithError: Story = {
  args: {
    label: 'Country',
    error: 'Please select a country',
  },
  render: (args) => <NativeSelect {...args}>{countryOptions}</NativeSelect>,
};

export const WithHelperText: Story = {
  args: {
    label: 'Country',
    helperText: 'Select the country where you reside',
  },
  render: (args) => <NativeSelect {...args}>{countryOptions}</NativeSelect>,
};

export const FullWidth: Story = {
  args: {
    label: 'Country',
    fullWidth: true,
  },
  render: (args) => <NativeSelect {...args}>{countryOptions}</NativeSelect>,
};