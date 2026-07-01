import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import type { SelectOption } from './SelectContext';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const fruitOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
];

const countryOptions: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' },
  { value: 'cn', label: 'China' },
];

export const Default: Story = {
  args: {
    label: 'Fruit',
    options: fruitOptions,
    placeholder: 'Select a fruit',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Select
          label="Fruit"
          options={fruitOptions}
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Select a fruit"
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: {value || '(none)'}
        </p>
      </div>
    );
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Fruit',
    options: fruitOptions,
    helperText: 'Choose your favourite fruit',
    placeholder: 'Select a fruit',
  },
};

export const WithError: Story = {
  args: {
    label: 'Fruit',
    options: fruitOptions,
    error: 'Please select a fruit',
    placeholder: 'Select a fruit',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Fruit',
    options: fruitOptions,
    disabled: true,
    placeholder: 'Select a fruit',
  },
};

export const WithDisabledOptions: Story = {
  args: {
    label: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana (unavailable)', disabled: true },
      { value: 'cherry', label: 'Cherry' },
      { value: 'durian', label: 'Durian (unavailable)', disabled: true },
      { value: 'elderberry', label: 'Elderberry' },
    ],
    placeholder: 'Select a fruit',
    label: 'Fruit',
  },
};

export const Multiple: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Select
          label="Fruits"
          options={fruitOptions}
          multiple
          value={values}
          onChange={(v) => setValues(v as string[])}
          placeholder="Select fruits"
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: {values.length > 0 ? values.join(', ') : '(none)'}
        </p>
      </div>
    );
  },
};

export const LongList: Story = {
  render: () => {
    const longOptions: SelectOption[] = Array.from({ length: 200 }, (_, i) => ({
      value: `option-${i + 1}`,
      label: `Option ${i + 1}`,
    }));
    const [value, setValue] = useState('');
    return (
      <Select
        label="Item"
        options={longOptions}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Select an item"
      />
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Tip: With the listbox open, type a letter to jump to matching options.
        </p>
        <Select
          label="Country"
          options={countryOptions}
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Select a country"
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: {value || '(none)'}
        </p>
      </div>
    );
  },
};

export const Grouped: Story = {
  render: () => {
    const groupedOptions: SelectOption[] = [
      { value: 'section-fruits', label: '── Fruits ──', disabled: true },
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'section-veggies', label: '── Vegetables ──', disabled: true },
      { value: 'carrot', label: 'Carrot' },
      { value: 'broccoli', label: 'Broccoli' },
      { value: 'spinach', label: 'Spinach' },
    ];
    const [value, setValue] = useState('');
    return (
      <Select
        label="Food"
        options={groupedOptions}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Select a food"
      />
    );
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Fruit',
    options: fruitOptions,
    placeholder: 'Select a fruit',
    fullWidth: true,
  },
};