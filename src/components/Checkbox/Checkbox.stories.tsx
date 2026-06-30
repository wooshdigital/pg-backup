import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
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
    label: 'Receive newsletter',
    defaultChecked: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Receive email notifications when someone mentions you.',
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all',
    indeterminate: true,
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
    label: 'Disabled checked option',
    disabled: true,
    defaultChecked: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Accept terms',
    error: 'You must accept the terms to continue.',
  },
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label={checked ? 'Checked' : 'Unchecked'}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
};

export const IndeterminateControlled: Story = {
  render: () => {
    const [state, setState] = useState<'unchecked' | 'indeterminate' | 'checked'>(
      'indeterminate',
    );
    const cycle = () => {
      setState((s) =>
        s === 'unchecked' ? 'indeterminate' : s === 'indeterminate' ? 'checked' : 'unchecked',
      );
    };
    return (
      <Checkbox
        label={`State: ${state}`}
        checked={state === 'checked'}
        indeterminate={state === 'indeterminate'}
        onChange={cycle}
      />
    );
  },
};

export const CheckboxGroupDefault: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    const toggle = (value: string) =>
      setValues((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    return (
      <CheckboxGroup legend="Notify me about">
        {['Comments', 'Mentions', 'Follows', 'New features'].map((opt) => (
          <Checkbox
            key={opt}
            label={opt}
            value={opt.toLowerCase()}
            checked={values.includes(opt.toLowerCase())}
            onChange={() => toggle(opt.toLowerCase())}
          />
        ))}
      </CheckboxGroup>
    );
  },
};

export const CheckboxGroupHorizontal: Story = {
  render: () => (
    <CheckboxGroup legend="Preferred contact" orientation="horizontal">
      <Checkbox label="Email" name="contact" value="email" />
      <Checkbox label="Phone" name="contact" value="phone" />
      <Checkbox label="SMS" name="contact" value="sms" />
    </CheckboxGroup>
  ),
};

export const CheckboxGroupRequired: Story = {
  render: () => (
    <CheckboxGroup legend="Agree to all" required error="You must select all required options.">
      <Checkbox label="Terms of Service" />
      <Checkbox label="Privacy Policy" />
    </CheckboxGroup>
  ),
};

export const CheckboxGroupDisabled: Story = {
  render: () => (
    <CheckboxGroup legend="Disabled group" disabled>
      <Checkbox label="Option 1" />
      <Checkbox label="Option 2" />
      <Checkbox label="Option 3" />
    </CheckboxGroup>
  ),
};