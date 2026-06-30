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
    label: 'I agree to the terms',
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  render: () => {
    const ref = React.createRef<HTMLInputElement>();
    return (
      <Checkbox
        ref={ref}
        label="Select all"
        indeterminate
        onChange={() => {}}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    label: 'This option is unavailable',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'This option is unavailable',
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
    label: 'Accept terms and conditions',
    error: 'You must accept the terms to continue.',
  },
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label={`Controlled checkbox (${checked ? 'checked' : 'unchecked'})`}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
};

export const IndeterminateControlled: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: '1', label: 'Item 1', checked: true },
      { id: '2', label: 'Item 2', checked: false },
      { id: '3', label: 'Item 3', checked: true },
    ]);

    const allChecked = items.every((i) => i.checked);
    const someChecked = items.some((i) => i.checked) && !allChecked;

    const handleParentChange = () => {
      setItems((prev) =>
        prev.map((i) => ({ ...i, checked: !allChecked }))
      );
    };

    const handleChildChange = (id: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Checkbox
          label="Select all items"
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleParentChange}
        />
        <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item) => (
            <Checkbox
              key={item.id}
              label={item.label}
              checked={item.checked}
              onChange={() => handleChildChange(item.id)}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const GroupDefault: StoryObj = {
  render: () => (
    <CheckboxGroup legend="Preferred contact methods">
      <Checkbox label="Email" name="contact" value="email" />
      <Checkbox label="Phone" name="contact" value="phone" />
      <Checkbox label="SMS" name="contact" value="sms" />
    </CheckboxGroup>
  ),
};

export const GroupHorizontal: StoryObj = {
  render: () => (
    <CheckboxGroup legend="Select days" layout="horizontal">
      <Checkbox label="Mon" name="days" value="mon" />
      <Checkbox label="Tue" name="days" value="tue" />
      <Checkbox label="Wed" name="days" value="wed" />
      <Checkbox label="Thu" name="days" value="thu" />
      <Checkbox label="Fri" name="days" value="fri" />
    </CheckboxGroup>
  ),
};

export const GroupWithError: StoryObj = {
  render: () => (
    <CheckboxGroup
      legend="Interests"
      error="Please select at least one interest."
    >
      <Checkbox label="Technology" name="interests" value="tech" />
      <Checkbox label="Design" name="interests" value="design" />
      <Checkbox label="Business" name="interests" value="business" />
    </CheckboxGroup>
  ),
};

export const GroupWithHelperText: StoryObj = {
  render: () => (
    <CheckboxGroup
      legend="Notification preferences"
      helperText="Choose when you'd like to be notified."
    >
      <Checkbox label="New messages" name="notifs" value="messages" />
      <Checkbox label="Mentions" name="notifs" value="mentions" />
      <Checkbox label="Updates" name="notifs" value="updates" />
    </CheckboxGroup>
  ),
};

export const GroupRequired: StoryObj = {
  render: () => (
    <CheckboxGroup legend="Agreement" required>
      <Checkbox label="I accept the terms of service" name="agree" value="tos" />
      <Checkbox label="I accept the privacy policy" name="agree" value="privacy" />
    </CheckboxGroup>
  ),
};