import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  args: {
    label: 'Subscribed to newsletter',
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  render: () => {
    const [checked, setChecked] = useState<boolean[]>([true, false, false]);

    const allChecked = checked.every(Boolean);
    const someChecked = checked.some(Boolean) && !allChecked;

    const handleGroupChange = (val: boolean) => {
      setChecked([val, val, val]);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Checkbox
          label="Select all"
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleGroupChange}
        />
        <div style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Apple', 'Banana', 'Cherry'].map((fruit, i) => (
            <Checkbox
              key={fruit}
              label={fruit}
              checked={checked[i]}
              onChange={(val) => {
                const next = [...checked];
                next[i] = val;
                setChecked(next);
              }}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled and checked',
    disabled: true,
    defaultChecked: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Subscribe to newsletter',
    helperText: 'You can unsubscribe at any time.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Accept terms',
    error: 'You must accept the terms to continue.',
  },
};

export const CheckboxGroupStory: StoryObj = {
  name: 'CheckboxGroup',
  render: () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({
      email: true,
      sms: false,
      push: false,
    });

    const toggle = (key: string) => (val: boolean) => {
      setSelected((prev) => ({ ...prev, [key]: val }));
    };

    return (
      <CheckboxGroup legend="Notification preferences" helperText="Select all that apply">
        <Checkbox label="Email" checked={selected.email} onChange={toggle('email')} />
        <Checkbox label="SMS" checked={selected.sms} onChange={toggle('sms')} />
        <Checkbox
          label="Push notifications"
          checked={selected.push}
          onChange={toggle('push')}
        />
      </CheckboxGroup>
    );
  },
};

export const CheckboxGroupHorizontal: StoryObj = {
  name: 'CheckboxGroup (Horizontal)',
  render: () => (
    <CheckboxGroup legend="Dietary preferences" orientation="horizontal">
      <Checkbox label="Vegetarian" />
      <Checkbox label="Vegan" />
      <Checkbox label="Gluten-free" />
    </CheckboxGroup>
  ),
};

export const CheckboxGroupWithError: StoryObj = {
  name: 'CheckboxGroup with Error',
  render: () => (
    <CheckboxGroup legend="Interests" error="Please select at least one option" required>
      <Checkbox label="Sports" />
      <Checkbox label="Music" />
      <Checkbox label="Technology" />
    </CheckboxGroup>
  ),
};