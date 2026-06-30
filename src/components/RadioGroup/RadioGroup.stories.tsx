import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup legend="Notification frequency" {...args}>
      <Radio value="immediately" label="Immediately" />
      <Radio value="daily" label="Daily digest" />
      <Radio value="weekly" label="Weekly summary" />
      <Radio value="never" label="Never" />
    </RadioGroup>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <RadioGroup legend="Notification frequency" defaultValue="daily">
      <Radio value="immediately" label="Immediately" />
      <Radio value="daily" label="Daily digest" />
      <Radio value="weekly" label="Weekly summary" />
      <Radio value="never" label="Never" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup legend="Size" orientation="horizontal" defaultValue="medium">
      <Radio value="small" label="Small" />
      <Radio value="medium" label="Medium" />
      <Radio value="large" label="Large" />
      <Radio value="xlarge" label="X-Large" />
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup legend="Plan" defaultValue="pro">
      <Radio
        value="free"
        label="Free"
        description="Up to 3 projects, 1GB storage"
      />
      <Radio
        value="pro"
        label="Pro"
        description="Unlimited projects, 50GB storage, priority support"
      />
      <Radio
        value="enterprise"
        label="Enterprise"
        description="Custom limits, SLA guarantees, dedicated support"
      />
    </RadioGroup>
  ),
};

export const WithDisabledOption: Story = {
  render: () => (
    <RadioGroup legend="Payment method" defaultValue="card">
      <Radio value="card" label="Credit card" />
      <Radio value="bank" label="Bank transfer" />
      <Radio value="crypto" label="Cryptocurrency (coming soon)" disabled />
    </RadioGroup>
  ),
};

export const AllDisabled: Story = {
  render: () => (
    <RadioGroup legend="Status" disabled defaultValue="active">
      <Radio value="active" label="Active" />
      <Radio value="paused" label="Paused" />
      <Radio value="archived" label="Archived" />
    </RadioGroup>
  ),
};

export const WithError: Story = {
  render: () => (
    <RadioGroup
      legend="Terms"
      required
      error="You must select an option to continue."
    >
      <Radio value="agree" label="I agree to the terms" />
      <Radio value="disagree" label="I disagree" />
    </RadioGroup>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <RadioGroup
      legend="Delivery speed"
      helperText="Faster delivery options may incur additional charges."
      defaultValue="standard"
    >
      <Radio value="standard" label="Standard (5-7 days)" />
      <Radio value="express" label="Express (2-3 days)" />
      <Radio value="overnight" label="Overnight" />
    </RadioGroup>
  ),
};

export const Required: Story = {
  render: () => (
    <RadioGroup legend="Gender" required>
      <Radio value="male" label="Male" />
      <Radio value="female" label="Female" />
      <Radio value="nonbinary" label="Non-binary" />
      <Radio value="prefer_not" label="Prefer not to say" />
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div>
        <RadioGroup
          legend="Favourite season"
          value={value}
          onChange={setValue}
        >
          <Radio value="spring" label="Spring" />
          <Radio value="summer" label="Summer" />
          <Radio value="autumn" label="Autumn" />
          <Radio value="winter" label="Winter" />
        </RadioGroup>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: {value || '(none)'}
        </p>
      </div>
    );
  },
};