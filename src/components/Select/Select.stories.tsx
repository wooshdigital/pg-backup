import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import type { SelectOption } from './SelectContext';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

/* ── Option data ─────────────────────────────────────────────── */

const FRUITS: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry', disabled: true },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];

const COUNTRIES: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' },
  { value: 'cn', label: 'China' },
];

const LONG_LIST: SelectOption[] = Array.from({ length: 200 }, (_, i) => ({
  value: `item-${i}`,
  label: `Option ${i + 1}`,
  disabled: i % 15 === 0 && i > 0,
}));

/* ── Stories ──────────────────────────────────────────────────── */

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        id="default-label"
        style={{
          display: 'block',
          marginBottom: 4,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Fruit
      </label>
      <Select
        options={FRUITS}
        aria-labelledby="default-label"
        placeholder="Select a fruit…"
      />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('banana');
    return (
      <div style={{ width: 280 }}>
        <label
          id="controlled-label"
          style={{
            display: 'block',
            marginBottom: 4,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Fruit (controlled)
        </label>
        <Select
          options={FRUITS}
          aria-labelledby="controlled-label"
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Select a fruit…"
        />
        <p style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 280 }}>
        <label
          id="search-label"
          style={{
            display: 'block',
            marginBottom: 4,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Country
        </label>
        <Select
          options={COUNTRIES}
          aria-labelledby="search-label"
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Search countries…"
          searchable
        />
      </div>
    );
  },
};

export const LongList: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        id="long-label"
        style={{
          display: 'block',
          marginBottom: 4,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Pick an item (200 options, virtualized)
      </label>
      <Select
        options={LONG_LIST}
        aria-labelledby="long-label"
        placeholder="Select an item…"
        searchable
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        id="disabled-label"
        style={{
          display: 'block',
          marginBottom: 4,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Fruit (disabled)
      </label>
      <Select
        options={FRUITS}
        aria-labelledby="disabled-label"
        disabled
        defaultValue="cherry"
      />
    </div>
  ),
};

export const Multiple: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(['apple', 'cherry']);
    return (
      <div style={{ width: 280 }}>
        <label
          id="multi-label"
          style={{
            display: 'block',
            marginBottom: 4,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Fruits (multiple)
        </label>
        <Select
          options={FRUITS}
          aria-labelledby="multi-label"
          value={values}
          onChange={(v) => setValues(v as string[])}
          multiple
          placeholder="Select fruits…"
        />
        <p style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
          Selected: <strong>{values.join(', ') || 'none'}</strong>
        </p>
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <label
        id="error-label"
        style={{
          display: 'block',
          marginBottom: 4,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Fruit
      </label>
      <Select
        options={FRUITS}
        aria-labelledby="error-label"
        aria-describedby="error-hint"
        error
        placeholder="Select a fruit…"
      />
      <p
        id="error-hint"
        style={{ marginTop: 4, fontSize: 13, color: '#ef4444' }}
      >
        Please select a fruit.
      </p>
    </div>
  ),
};

export const Grouped: Story = {
  render: () => {
    const groupedOptions: SelectOption[] = [
      { value: 'apple', label: 'Apple', group: 'Fruits' },
      { value: 'banana', label: 'Banana', group: 'Fruits' },
      { value: 'cherry', label: 'Cherry', group: 'Fruits' },
      { value: 'broccoli', label: 'Broccoli', group: 'Vegetables' },
      { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
      { value: 'spinach', label: 'Spinach', group: 'Vegetables' },
      { value: 'almond', label: 'Almond', group: 'Nuts' },
      { value: 'walnut', label: 'Walnut', group: 'Nuts' },
    ];
    return (
      <div style={{ width: 280 }}>
        <label
          id="grouped-label"
          style={{
            display: 'block',
            marginBottom: 4,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Food
        </label>
        <Select
          options={groupedOptions}
          aria-labelledby="grouped-label"
          placeholder="Select a food…"
          searchable
        />
      </div>
    );
  },
};