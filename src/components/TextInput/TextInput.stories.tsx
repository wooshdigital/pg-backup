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
      options: [undefined, 'error', 'success', 'warning'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
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
      <Label>Full Name</Label>
      <TextInput placeholder="Jane Doe" />
    </FormField>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <FormField>
      <Label>Email</Label>
      <TextInput type="email" placeholder="jane@example.com" />
      <HelperText>We will never share your email.</HelperText>
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField>
      <Label>Email</Label>
      <TextInput type="email" defaultValue="not-an-email" validationState="error" />
      <ErrorMessage>Please enter a valid email address.</ErrorMessage>
    </FormField>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <FormField>
      <Label>Username</Label>
      <TextInput defaultValue="janedoe" validationState="success" />
      <HelperText>Username is available!</HelperText>
    </FormField>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 100;
    const [value, setValue] = useState('');
    return (
      <FormField>
        <Label>Bio</Label>
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX}
          placeholder="Tell us about yourself…"
          fullWidth
        />
        <CharacterCount current={value.length} max={MAX} />
      </FormField>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <FormField>
      <Label>Email</Label>
      <TextInput type="email" defaultValue="jane@example.com" disabled />
    </FormField>
  ),
};

export const Readonly: Story = {
  render: () => (
    <FormField>
      <Label>API Key</Label>
      <TextInput value="sk-xxxx-yyyy-zzzz" readOnly onChange={() => {}} />
      <HelperText>This key is read-only.</HelperText>
    </FormField>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <FormField>
      <Label>Website</Label>
      <TextInput
        type="url"
        placeholder="example.com"
        prefix={<span style={{ fontSize: '0.875rem' }}>https://</span>}
        fullWidth
      />
    </FormField>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <FormField>
      <Label>Search</Label>
      <TextInput
        type="search"
        placeholder="Search…"
        suffix={<span>🔍</span>}
        fullWidth
      />
    </FormField>
  ),
};

export const AllInputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date'] as const).map(
        (type) => (
          <FormField key={type}>
            <Label>{type}</Label>
            <TextInput type={type} placeholder={`Enter ${type}`} />
          </FormField>
        )
      )}
    </div>
  ),
};

export const NumericInputMode: Story = {
  render: () => (
    <FormField>
      <Label>Quantity</Label>
      <TextInput inputMode="numeric" pattern="[0-9]*" placeholder="0" />
      <HelperText>Numbers only on mobile keyboards.</HelperText>
    </FormField>
  ),
};