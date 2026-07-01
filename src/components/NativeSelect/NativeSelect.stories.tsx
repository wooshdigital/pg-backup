import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NativeSelect } from './NativeSelect';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
  args: {
    label: 'Select an option',
  },
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

export const Default: Story = {
  render: (args) => (
    <NativeSelect {...args}>
      <option value="">Choose...</option>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </NativeSelect>
  ),
};

export const WithPlaceholder: Story = {
  render: (args) => (
    <NativeSelect {...args} label="Fruit">
      <option value="" disabled hidden>Select a fruit...</option>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
      <option value="date">Date</option>
      <option value="elderberry">Elderberry</option>
    </NativeSelect>
  ),
};

export const Multiple: Story = {
  render: (args) => (
    <NativeSelect {...args} label="Interests" multiple size={4}>
      <option value="tech">Technology</option>
      <option value="art">Art</option>
      <option value="sports">Sports</option>
      <option value="music">Music</option>
      <option value="cooking">Cooking</option>
    </NativeSelect>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <NativeSelect {...args} label="Disabled Select" disabled>
      <option value="">Cannot change</option>
      <option value="a">Option A</option>
    </NativeSelect>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <NativeSelect {...args} label="Country" error="Please select a country">
      <option value="">Select country...</option>
      <option value="us">United States</option>
      <option value="uk">United Kingdom</option>
      <option value="ca">Canada</option>
    </NativeSelect>
  ),
};

export const WithHelperText: Story = {
  render: (args) => (
    <NativeSelect {...args} label="Time Zone" helperText="Select your local time zone for accurate scheduling">
      <option value="">Select timezone...</option>
      <option value="utc">UTC</option>
      <option value="est">Eastern Time (ET)</option>
      <option value="pst">Pacific Time (PT)</option>
    </NativeSelect>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('banana');
    return (
      <div>
        <NativeSelect
          {...args}
          label="Controlled Select"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </NativeSelect>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};