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
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup legend="Choose a plan" name="plan">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="enterprise" label="Enterprise" />
    </RadioGroup>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <RadioGroup legend="Choose a plan" name="plan-default" defaultValue="pro">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="enterprise" label="Enterprise" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup legend="Select size" name="size" layout="horizontal">
      <Radio value="xs" label="XS" />
      <Radio value="sm" label="SM" />
      <Radio value="md" label="MD" />
      <Radio value="lg" label="LG" />
      <Radio value="xl" label="XL" />
    </RadioGroup>
  ),
};

export const WithDisabledOption: Story = {
  render: () => (
    <RadioGroup
      legend="Select payment method"
      name="payment"
      defaultValue="card"
    >
      <Radio value="card" label="Credit / Debit Card" />
      <Radio value="paypal" label="PayPal" />
      <Radio value="crypto" label="Cryptocurrency (unavailable)" disabled />
    </RadioGroup>
  ),
};

export const AllDisabled: Story = {
  render: () => (
    <RadioGroup legend="Read-only selection" name="readonly" defaultValue="b" disabled>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

export const WithError: Story = {
  render: () => (
    <RadioGroup
      legend="Preferred contact method"
      name="contact"
      error="Please select a contact method."
    >
      <Radio value="email" label="Email" />
      <Radio value="phone" label="Phone" />
      <Radio value="mail" label="Mail" />
    </RadioGroup>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <RadioGroup
      legend="Notification frequency"
      name="frequency"
      helperText="You can change this setting at any time."
      defaultValue="daily"
    >
      <Radio value="realtime" label="Real-time" />
      <Radio value="daily" label="Daily digest" />
      <Radio value="weekly" label="Weekly summary" />
      <Radio value="never" label="Never" />
    </RadioGroup>
  ),
};

export const Required: Story = {
  render: () => (
    <RadioGroup
      legend="Gender"
      name="gender"
      required
    >
      <Radio value="male" label="Male" />
      <Radio value="female" label="Female" />
      <Radio value="nonbinary" label="Non-binary" />
      <Radio value="prefer-not" label="Prefer not to say" />
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('monthly');
    return (
      <div>
        <RadioGroup
          legend="Billing cycle"
          name="billing"
          value={value}
          onChange={setValue}
        >
          <Radio value="monthly" label="Monthly" />
          <Radio value="quarterly" label="Quarterly" />
          <Radio value="annual" label="Annual (save 20%)" />
        </RadioGroup>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: <strong>{value}</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={() => setValue('monthly')}>Set Monthly</button>
          <button onClick={() => setValue('annual')}>Set Annual</button>
        </div>
      </div>
    );
  },
};

export const HorizontalWithError: Story = {
  render: () => (
    <RadioGroup
      legend="Rating"
      name="rating"
      layout="horizontal"
      error="Please provide a rating."
    >
      <Radio value="1" label="1 ★" />
      <Radio value="2" label="2 ★" />
      <Radio value="3" label="3 ★" />
      <Radio value="4" label="4 ★" />
      <Radio value="5" label="5 ★" />
    </RadioGroup>
  ),
};