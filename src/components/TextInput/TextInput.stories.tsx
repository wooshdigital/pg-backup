import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    validationState: {
      control: 'select',
      options: ['none', 'error', 'success', 'warning'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    inputMode: {
      control: 'select',
      options: ['text', 'numeric', 'email', 'url', 'tel', 'search', 'decimal'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    'aria-label': 'Default input',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor="name-input" style={{ fontWeight: 500, fontSize: 14 }}>
        Full Name
      </label>
      <TextInput id="name-input" placeholder="John Doe" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor="email-error" style={{ fontWeight: 500, fontSize: 14 }}>
        Email
      </label>
      <TextInput
        id="email-error"
        type="email"
        defaultValue="not-an-email"
        validationState="error"
        aria-invalid={true}
        aria-describedby="email-error-msg"
      />
      <span id="email-error-msg" style={{ color: '#ef4444', fontSize: 13 }}>
        Please enter a valid email address.
      </span>
    </div>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor="user-success" style={{ fontWeight: 500, fontSize: 14 }}>
        Username
      </label>
      <TextInput
        id="user-success"
        defaultValue="johndoe"
        validationState="success"
        aria-describedby="user-success-msg"
      />
      <span id="user-success-msg" style={{ color: '#22c55e', fontSize: 13 }}>
        Username is available!
      </span>
    </div>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor="pass-input" style={{ fontWeight: 500, fontSize: 14 }}>
        Password
      </label>
      <TextInput
        id="pass-input"
        type="password"
        aria-describedby="pass-helper"
      />
      <span id="pass-helper" style={{ color: '#6b7280', fontSize: 13 }}>
        Must be at least 8 characters.
      </span>
    </div>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 100;
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label htmlFor="bio-input" style={{ fontWeight: 500, fontSize: 14 }}>
          Bio
        </label>
        <TextInput
          id="bio-input"
          maxLength={MAX}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tell us about yourself..."
        />
        <CharacterCount current={value.length} max={MAX} />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 'Cannot edit this',
    disabled: true,
    'aria-label': 'Disabled input',
  },
};

export const Readonly: Story = {
  args: {
    defaultValue: 'Read only value',
    readOnly: true,
    'aria-label': 'Read-only input',
  },
};

export const WithPrefix: Story = {
  render: () => (
    <TextInput
      placeholder="0.00"
      inputMode="decimal"
      aria-label="Amount"
      prefix={<span style={{ fontSize: 16 }}>$</span>}
    />
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <TextInput
      placeholder="username"
      aria-label="Username with domain"
      suffix={<span style={{ fontSize: 14, color: '#6b7280' }}>@example.com</span>}
    />
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: () => (
    <TextInput
      placeholder="0.00"
      inputMode="decimal"
      aria-label="Price in USD"
      prefix={<span style={{ fontSize: 16 }}>$</span>}
      suffix={<span style={{ fontSize: 13, color: '#6b7280' }}>USD</span>}
    />
  ),
};

export const AllInputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(
        [
          { type: 'text', label: 'Text', placeholder: 'text input' },
          { type: 'email', label: 'Email', placeholder: 'you@example.com', inputMode: 'email' as const },
          { type: 'url', label: 'URL', placeholder: 'https://', inputMode: 'url' as const },
          { type: 'tel', label: 'Phone', placeholder: '+1 (555) 000-0000', inputMode: 'tel' as const },
          { type: 'number', label: 'Number', placeholder: '42', inputMode: 'numeric' as const },
          { type: 'password', label: 'Password', placeholder: '••••••••' },
          { type: 'search', label: 'Search', placeholder: 'Search...', inputMode: 'search' as const },
        ] as const
      ).map(({ type, label, placeholder, inputMode }) => (
        <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor={`type-${type}`} style={{ fontWeight: 500, fontSize: 14 }}>
            {label}
          </label>
          <TextInput
            id={`type-${type}`}
            type={type}
            placeholder={placeholder}
            inputMode={inputMode}
          />
        </div>
      ))}
    </div>
  ),
};