import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import type { SelectOption } from './SelectContext';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    label: 'Select an option',
    placeholder: 'Choose...',
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const fruitOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

const fruitOptionsWithDisabled: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry', disabled: true },
];

export const Default: Story = {
  args: {
    options: fruitOptions,
    label: 'Fruit',
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('banana');
    return (
      <div>
        <Select
          {...args}
          options={fruitOptions}
          label="Fruit (Controlled)"
          value={value}
          onChange={(v) => setValue(v as string)}
        />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

export const WithSearch: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <Select
        {...args}
        options={fruitOptions}
        label="Type to search"
        placeholder="Type a letter..."
        value={value}
        onChange={(v) => setValue(v as string)}
      />
    );
  },
};

export const LongList: Story = {
  render: (args) => {
    const longOptions: SelectOption[] = Array.from({ length: 200 }, (_, i) => ({
      value: `option-${i}`,
      label: `Option ${i + 1}`,
    }));
    return (
      <Select
        {...args}
        options={longOptions}
        label="Long List (200 items)"
        placeholder="Select from 200 options..."
      />
    );
  },
};

export const Grouped: Story = {
  render: (args) => {
    const groupedOptions: SelectOption[] = [
      { value: 'apple', label: '🍎 Apple' },
      { value: 'banana', label: '🍌 Banana' },
      { value: 'cherry', label: '🍒 Cherry' },
      { value: 'carrot', label: '🥕 Carrot' },
      { value: 'broccoli', label: '🥦 Broccoli' },
      { value: 'spinach', label: '🥬 Spinach' },
    ];
    return (
      <Select
        {...args}
        options={groupedOptions}
        label="Food"
        placeholder="Select food..."
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    options: fruitOptions,
    label: 'Disabled Select',
    disabled: true,
    value: 'apple',
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: fruitOptionsWithDisabled,
    label: 'Fruit (some disabled)',
  },
};

export const Multiple: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div>
        <Select
          {...args}
          options={fruitOptions}
          label="Fruits (Multiple)"
          multiple
          value={value}
          onChange={(v) => setValue(v as string[])}
        />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Selected: <strong>{(value as string[]).join(', ') || 'none'}</strong>
        </p>
      </div>
    );
  },
};

export const WithError: Story = {
  args: {
    options: fruitOptions,
    label: 'Fruit',
    error: 'Please select a fruit',
  },
};

export const WithHelperText: Story = {
  args: {
    options: fruitOptions,
    label: 'Fruit',
    helperText: 'Choose your favourite fruit from the list',
  },
};

export const FullWidth: Story = {
  args: {
    options: fruitOptions,
    label: 'Full Width Select',
    fullWidth: true,
  },
};