import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NativeSelect } from './NativeSelect';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

const BasicOptions = () => (
  <>
    <option value="us">United States</option>
    <option value="ca">Canada</option>
    <option value="gb">United Kingdom</option>
    <option value="au">Australia</option>
    <option value="de">Germany</option>
    <option value="fr">France</option>
    <option value="jp">Japan</option>
  </>
);

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        htmlFor="default-select"
        style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}
      >
        Country
      </label>
      <NativeSelect id="default-select">
        <BasicOptions />
      </NativeSelect>
    </div>
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        htmlFor="placeholder-select"
        style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}
      >
        Country
      </label>
      <NativeSelect id="placeholder-select">
        <option value="" disabled>
          Select a country…
        </option>
        <BasicOptions />
      </NativeSelect>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('ca');
    return (
      <div style={{ width: 280 }}>
        <label
          htmlFor="controlled-select"
          style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}
        >
          Country (controlled)
        </label>
        <NativeSelect
          id="controlled-select"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <BasicOptions />
        </NativeSelect>
        <p style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        htmlFor="multiple-select"
        style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}
      >
        Countries (hold Ctrl/Cmd to select multiple)
      </label>
      <NativeSelect id="multiple-select" multiple size={5}>
        <BasicOptions />
      </NativeSelect>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        htmlFor="disabled-select"
        style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}
      >
        Country
      </label>
      <NativeSelect id="disabled-select" disabled>
        <option value="us">United States</option>
        <BasicOptions />
      </NativeSelect>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        htmlFor="error-select"
        style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}
      >
        Country
      </label>
      <NativeSelect
        id="error-select"
        error
        aria-describedby="error-select-msg"
      >
        <option value="">Select a country…</option>
        <BasicOptions />
      </NativeSelect>
      <p
        id="error-select-msg"
        style={{ marginTop: 4, fontSize: 13, color: '#ef4444' }}
      >
        Please select a country.
      </p>
    </div>
  ),
};