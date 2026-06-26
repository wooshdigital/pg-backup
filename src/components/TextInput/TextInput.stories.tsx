import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormField } from '../FormField/FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    validationState: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    inputMode: {
      control: 'select',
      options: ['none', 'text', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text…',
    'aria-label': 'Default input',
  },
};

export const WithLabel: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="name-input">Full name</Label>
      <TextInput id="name-input" placeholder="Jane Doe" />
    </FormField>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="email-input">Email address</Label>
      <TextInput id="email-input" type="email" placeholder="jane@example.com" />
      <HelperText id="email-helper">We'll never share your email with anyone.</HelperText>
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField invalid>
      <Label htmlFor="err-input" required>
        Username
      </Label>
      <TextInput id="err-input" validationState="error" defaultValue="ab" />
      <ErrorMessage id="err-msg">Username must be at least 3 characters.</ErrorMessage>
    </FormField>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="success-input">Username</Label>
      <TextInput id="success-input" validationState="success" defaultValue="janedoe" />
      <HelperText id="success-helper">Username is available!</HelperText>
    </FormField>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    function Example() {
      const [value, setValue] = useState('');
      const MAX = 100;
      return (
        <FormField>
          <Label htmlFor="charcount-input">Bio</Label>
          <TextInput
            id="charcount-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={MAX}
            aria-describedby="bio-count"
            placeholder="Tell us about yourself…"
          />
          <CharacterCount id="bio-count" current={value.length} max={MAX} />
        </FormField>
      );
    }
    return <Example />;
  },
};

export const Disabled: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="disabled-input">Read-only field</Label>
      <TextInput id="disabled-input" disabled value="Cannot edit this" onChange={() => {}} />
    </FormField>
  ),
};

export const Readonly: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="readonly-input">Account ID</Label>
      <TextInput id="readonly-input" readOnly value="ACC-123456" />
    </FormField>
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="prefix-input">Amount</Label>
      <TextInput
        id="prefix-input"
        inputMode="decimal"
        prefix="$"
        suffix=".00"
        placeholder="0"
        type="text"
      />
    </FormField>
  ),
};

export const AllInputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['text', 'email', 'password', 'tel', 'url', 'search', 'number'] as const).map((type) => (
        <FormField key={type}>
          <Label htmlFor={`input-${type}`}>{type}</Label>
          <TextInput id={`input-${type}`} type={type} placeholder={`Enter ${type}…`} />
        </FormField>
      ))}
    </div>
  ),
};

export const NumericInputMode: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="numeric-input">PIN</Label>
      <TextInput
        id="numeric-input"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="000000"
      />
      <HelperText id="pin-helper">6-digit PIN</HelperText>
    </FormField>
  ),
};