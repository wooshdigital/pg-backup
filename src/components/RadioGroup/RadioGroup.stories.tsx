import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup legend="Favorite fruit" {...args}>
      <Radio value="apple" label="Apple" />
      <Radio value="banana" label="Banana" />
      <Radio value="cherry" label="Cherry" />
    </RadioGroup>
  ),
};

export const WithDefaultValue: Story = {
  render: (args) => (
    <RadioGroup legend="Shipping speed" defaultValue="standard" {...args}>
      <Radio value="express" label="Express (1-2 days)" />
      <Radio value="standard" label="Standard (3-5 days)" />
      <Radio value="economy" label="Economy (7-10 days)" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup legend="Alignment" orientation="horizontal" {...args}>
      <Radio value="left" label="Left" />
      <Radio value="center" label="Center" />
      <Radio value="right" label="Right" />
    </RadioGroup>
  ),
};

export const WithHelperText: Story = {
  render: (args) => (
    <RadioGroup
      legend="Notification frequency"
      helperText="This setting controls how often we contact you."
      {...args}
    >
      <Radio value="realtime" label="Real-time" />
      <Radio value="daily" label="Daily digest" />
      <Radio value="weekly" label="Weekly summary" />
      <Radio value="never" label="Never" />
    </RadioGroup>
  ),
};

export const WithDisabledOption: Story = {
  render: (args) => (
    <RadioGroup legend="Plan" defaultValue="free" {...args}>
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="enterprise" label="Enterprise (contact sales)" disabled />
    </RadioGroup>
  ),
};

export const FullyDisabled: Story = {
  render: (args) => (
    <RadioGroup legend="Read-only selection" defaultValue="option2" disabled {...args}>
      <Radio value="option1" label="Option 1" />
      <Radio value="option2" label="Option 2" />
      <Radio value="option3" label="Option 3" />
    </RadioGroup>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <RadioGroup legend="Gender" error="Please select an option" required {...args}>
      <Radio value="male" label="Male" />
      <Radio value="female" label="Female" />
      <Radio value="nonbinary" label="Non-binary" />
      <Radio value="prefer_not" label="Prefer not to say" />
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>('medium');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RadioGroup
          legend="T-shirt size"
          value={value}
          onChange={setValue}
        >
          <Radio value="small" label="Small" />
          <Radio value="medium" label="Medium" />
          <Radio value="large" label="Large" />
          <Radio value="xlarge" label="X-Large" />
        </RadioGroup>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Selected: <strong>{value}</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setValue('small')}>Select Small</button>
          <button onClick={() => setValue('large')}>Select Large</button>
        </div>
      </div>
    );
  },
};

export const Required: Story = {
  render: (args) => (
    <RadioGroup legend="Terms" required {...args}>
      <Radio value="agree" label="I agree to the terms" />
      <Radio value="disagree" label="I disagree" />
    </RadioGroup>
  ),
};