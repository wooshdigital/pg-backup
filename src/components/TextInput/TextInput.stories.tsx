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
  args: {
    placeholder: 'Enter text…',
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    'aria-label': 'Default input',
  },
};

export const WithLabel: Story = {
  render: () => (
    <FormField>
      <Label>Full name</Label>
      <TextInput placeholder="Jane Doe" />
    </FormField>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <FormField>
      <Label>Email address</Label>
      <TextInput type="email" placeholder="jane@example.com" />
      <HelperText>We will never share your email address.</HelperText>
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField error="Please enter a valid email address.">
      <Label>Email address</Label>
      <TextInput type="email" placeholder="jane@example.com" />
      <ErrorMessage>Please enter a valid email address.</ErrorMessage>
    </FormField>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 100;
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <FormField>
          <Label>Bio</Label>
          <TextInput
            value={value}
            onChange={e => setValue(e.target.value)}
            maxLength={MAX}
            placeholder="Tell us about yourself…"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <HelperText>Keep it short and sweet.</HelperText>
            <CharacterCount current={value.length} max={MAX} />
          </div>
        </FormField>
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
    readOnly: true,
  },
};

export const Readonly: Story = {
  args: {
    'aria-label': 'Readonly input',
    readOnly: true,
    defaultValue: 'Read-only value',
  },
};

export const WithPrefix: Story = {
  render: () => (
    <FormField>
      <Label>Amount</Label>
      <TextInput
        prefix={<span style={{ fontSize: '1rem', fontWeight: 600 }}>$</span>}
        inputMode="decimal"
        placeholder="0.00"
      />
    </FormField>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <FormField>
      <Label>Search</Label>
      <TextInput
        suffix={
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z"
              clipRule="evenodd"
            />
          </svg>
        }
        placeholder="Search…"
      />
    </FormField>
  ),
};

export const AllInputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(
        [
          { label: 'Text', type: 'text', placeholder: 'Plain text' },
          { label: 'Email', type: 'email', placeholder: 'you@example.com', inputMode: 'email' as const },
          { label: 'URL', type: 'url', placeholder: 'https://example.com', inputMode: 'url' as const },
          { label: 'Number', type: 'number', placeholder: '42', inputMode: 'numeric' as const },
          { label: 'Tel', type: 'tel', placeholder: '+1 555 000 0000', inputMode: 'tel' as const },
          { label: 'Password', type: 'password', placeholder: '••••••••' },
          { label: 'Search', type: 'search', placeholder: 'Search…' },
        ] as const
      ).map(({ label, type, placeholder, inputMode }) => (
        <FormField key={type}>
          <Label>{label}</Label>
          <TextInput type={type} placeholder={placeholder} inputMode={inputMode} />
        </FormField>
      ))}
    </div>
  ),
};