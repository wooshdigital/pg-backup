import React, { useRef, useState } from 'react';
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
    label: 'Accept terms and conditions',
    checked: true,
    onChange: () => {},
  },
};

export const Indeterminate: Story = {
  render: () => {
    const ref = useRef<HTMLInputElement>(null);
    return (
      <Checkbox
        ref={ref}
        label="Select all items"
        indeterminate={true}
        onChange={() => {}}
      />
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
    label: 'Disabled checked option',
    disabled: true,
    checked: true,
    onChange: () => {},
  },
};

export const WithError: Story = {
  args: {
    label: 'Accept terms and conditions',
    hasError: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label={checked ? 'Checked ✓' : 'Click to check'}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
};

export const IndeterminateWithSelectAll: Story = {
  render: () => {
    const [items, setItems] = useState([
      { label: 'Option A', checked: false },
      { label: 'Option B', checked: true },
      { label: 'Option C', checked: false },
    ]);
    const allChecked = items.every((i) => i.checked);
    const noneChecked = items.every((i) => !i.checked);
    const isIndeterminate = !allChecked && !noneChecked;

    const toggleAll = () => {
      setItems(items.map((i) => ({ ...i, checked: !allChecked })));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Checkbox
          label="Select all"
          checked={allChecked}
          indeterminate={isIndeterminate}
          onChange={toggleAll}
        />
        <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map((item, index) => (
            <Checkbox
              key={item.label}
              label={item.label}
              checked={item.checked}
              onChange={(e) => {
                const updated = [...items];
                updated[index] = { ...item, checked: e.target.checked };
                setItems(updated);
              }}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const GroupDefault: Story = {
  render: () => (
    <CheckboxGroup legend="Notification preferences">
      <Checkbox label="Email notifications" name="notifications" value="email" defaultChecked />
      <Checkbox label="SMS notifications" name="notifications" value="sms" />
      <Checkbox label="Push notifications" name="notifications" value="push" />
    </CheckboxGroup>
  ),
};

export const GroupHorizontal: Story = {
  render: () => (
    <CheckboxGroup legend="Sizes" orientation="horizontal">
      <Checkbox label="Small" name="size" value="sm" />
      <Checkbox label="Medium" name="size" value="md" defaultChecked />
      <Checkbox label="Large" name="size" value="lg" />
    </CheckboxGroup>
  ),
};

export const GroupWithError: Story = {
  render: () => (
    <CheckboxGroup
      legend="Notification preferences"
      errorMessage="Please select at least one notification method"
      required
    >
      <Checkbox label="Email notifications" name="notifications" value="email" />
      <Checkbox label="SMS notifications" name="notifications" value="sms" />
      <Checkbox label="Push notifications" name="notifications" value="push" />
    </CheckboxGroup>
  ),
};

export const GroupWithHelperText: Story = {
  render: () => (
    <CheckboxGroup
      legend="Notification preferences"
      helperText="You can select multiple options"
    >
      <Checkbox label="Email notifications" name="notifications" value="email" defaultChecked />
      <Checkbox label="SMS notifications" name="notifications" value="sms" />
      <Checkbox label="Push notifications" name="notifications" value="push" />
    </CheckboxGroup>
  ),
};