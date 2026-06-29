import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    validationState: {
      control: { type: 'select' },
      options: [undefined, 'error', 'success', 'warning'],
    },
    inputMode: {
      control: { type: 'select' },
      options: ['text', 'numeric', 'email', 'url', 'tel', 'decimal', 'search', 'none'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text…',
    id: 'default-input',
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <TextInput {...args} />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <label htmlFor="labeled" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Full name
      </label>
      <TextInput id="labeled" placeholder="Jane Doe" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <label htmlFor="err" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Email
      </label>
      <TextInput
        id="err"
        type="email"
        defaultValue="not-an-email"
        validationState="error"
        aria-invalid={true}
        aria-describedby="err-msg"
      />
      <span id="err-msg" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: 4, display: 'block' }}>
        Please enter a valid email address.
      </span>
    </div>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <label htmlFor="with-helper" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Username
      </label>
      <TextInput id="with-helper" placeholder="johndoe" aria-describedby="helper-msg" />
      <span id="helper-msg" style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 4, display: 'block' }}>
        Must be 3–20 characters, letters and numbers only.
      </span>
    </div>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 80;
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 320 }}>
        <label htmlFor="char-count-input" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          Short bio
        </label>
        <TextInput
          id="char-count-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX}
          aria-describedby="char-count-status"
        />
        <CharacterCount id="char-count-status" current={value.length} max={MAX} />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <label htmlFor="disabled-input" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Locked field
      </label>
      <TextInput id="disabled-input" defaultValue="Cannot edit" disabled />
    </div>
  ),
};

export const Readonly: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <label htmlFor="readonly-input" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Account ID
      </label>
      <TextInput id="readonly-input" defaultValue="ACC-000123" readOnly />
    </div>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <label htmlFor="prefix-input" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Amount
      </label>
      <TextInput id="prefix-input" prefix="$" inputMode="decimal" placeholder="0.00" />
    </div>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <label htmlFor="suffix-input" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Weight
      </label>
      <TextInput id="suffix-input" suffix="kg" inputMode="decimal" placeholder="70" />
    </div>
  ),
};

export const AllInputTypes: Story = {
  render: () => (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(
        [
          { label: 'Text', type: 'text', inputMode: 'text' as const, placeholder: 'Plain text' },
          { label: 'Email', type: 'email', inputMode: 'email' as const, placeholder: 'user@example.com' },
          { label: 'Numeric', type: 'text', inputMode: 'numeric' as const, placeholder: '12345' },
          { label: 'URL', type: 'url', inputMode: 'url' as const, placeholder: 'https://example.com' },
          { label: 'Tel', type: 'tel', inputMode: 'tel' as const, placeholder: '+1 555 000 0000' },
          { label: 'Password', type: 'password', inputMode: undefined, placeholder: '••••••••' },
        ] as const
      ).map(({ label, type, inputMode, placeholder }) => (
        <div key={label}>
          <label
            htmlFor={`type-${label.toLowerCase()}`}
            style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}
          >
            {label}
          </label>
          <TextInput
            id={`type-${label.toLowerCase()}`}
            type={type}
            inputMode={inputMode}
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  ),
};