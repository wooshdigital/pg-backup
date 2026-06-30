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
    <RadioGroup legend="Choose your plan" name="plan">
      <Radio value="free" label="Free — $0/month" />
      <Radio value="pro" label="Pro — $9/month" />
      <Radio value="enterprise" label="Enterprise — Contact us" />
    </RadioGroup>
  ),
};

export const WithDefaultSelection: Story = {
  render: () => (
    <RadioGroup legend="Choose your plan" name="plan-default" defaultValue="pro">
      <Radio value="free" label="Free — $0/month" />
      <Radio value="pro" label="Pro — $9/month" />
      <Radio value="enterprise" label="Enterprise — Contact us" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup legend="Notification frequency" name="frequency" orientation="horizontal">
      <Radio value="daily" label="Daily" />
      <Radio value="weekly" label="Weekly" />
      <Radio value="monthly" label="Monthly" />
      <Radio value="never" label="Never" />
    </RadioGroup>
  ),
};

export const WithDisabledOption: Story = {
  render: () => (
    <RadioGroup legend="Choose your plan" name="plan-disabled" defaultValue="free">
      <Radio value="free" label="Free — $0/month" />
      <Radio value="pro" label="Pro — $9/month" />
      <Radio value="enterprise" label="Enterprise — Not available" disabled />
    </RadioGroup>
  ),
};

export const AllDisabled: Story = {
  render: () => (
    <RadioGroup legend="Choose your plan" name="plan-all-disabled" disabled defaultValue="pro">
      <Radio value="free" label="Free — $0/month" />
      <Radio value="pro" label="Pro — $9/month" />
      <Radio value="enterprise" label="Enterprise — Contact us" />
    </RadioGroup>
  ),
};

export const WithError: Story = {
  render: () => (
    <RadioGroup
      legend="Choose your plan"
      name="plan-error"
      required
      errorMessage="Please select a plan to continue"
    >
      <Radio value="free" label="Free — $0/month" />
      <Radio value="pro" label="Pro — $9/month" />
      <Radio value="enterprise" label="Enterprise — Contact us" />
    </RadioGroup>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <RadioGroup
      legend="Choose your plan"
      name="plan-helper"
      helperText="You can change your plan at any time"
    >
      <Radio value="free" label="Free — $0/month" />
      <Radio value="pro" label="Pro — $9/month" />
      <Radio value="enterprise" label="Enterprise — Contact us" />
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('free');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RadioGroup
          legend="Choose your plan"
          name="plan-controlled"
          value={value}
          onChange={setValue}
        >
          <Radio value="free" label="Free — $0/month" />
          <Radio value="pro" label="Pro — $9/month" />
          <Radio value="enterprise" label="Enterprise — Contact us" />
        </RadioGroup>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

export const WithRichLabels: Story = {
  render: () => (
    <RadioGroup legend="Choose your plan" name="plan-rich">
      <Radio
        value="free"
        label={
          <div>
            <div style={{ fontWeight: 600 }}>Free</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Up to 3 projects, 1GB storage
            </div>
          </div>
        }
      />
      <Radio
        value="pro"
        label={
          <div>
            <div style={{ fontWeight: 600 }}>Pro — $9/month</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Unlimited projects, 100GB storage
            </div>
          </div>
        }
      />
      <Radio
        value="enterprise"
        label={
          <div>
            <div style={{ fontWeight: 600 }}>Enterprise</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Custom limits, priority support
            </div>
          </div>
        }
      />
    </RadioGroup>
  ),
};