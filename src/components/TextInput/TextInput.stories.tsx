import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 360, fontFamily: 'system-ui, sans-serif' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextInput>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    placeholder: 'Enter text…',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div>
      <label htmlFor="story-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
        Full name
      </label>
      <TextInput id="story-label" placeholder="Jane Smith" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div>
      <label htmlFor="story-error" style={{ display: 'block', marginBottom: 4 }}>
        Email
      </label>
      <TextInput id="story-error" validationState="error" defaultValue="not-an-email" aria-describedby="story-err-msg" />
      <span id="story-err-msg" role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>
        Please enter a valid email address.
      </span>
    </div>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <div>
      <label htmlFor="story-success" style={{ display: 'block', marginBottom: 4 }}>
        Username
      </label>
      <TextInput id="story-success" validationState="success" defaultValue="janedoe" />
    </div>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <div>
      <label htmlFor="story-helper" style={{ display: 'block', marginBottom: 4 }}>
        Password
      </label>
      <TextInput id="story-helper" type="password" aria-describedby="story-help" />
      <span id="story-help" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Minimum 8 characters.
      </span>
    </div>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 100;
    const [val, setVal] = useState('');
    return (
      <div>
        <label htmlFor="story-charcount" style={{ display: 'block', marginBottom: 4 }}>
          Bio
        </label>
        <TextInput
          id="story-charcount"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          maxLength={MAX}
          aria-describedby="story-cc"
        />
        <CharacterCount id="story-cc" current={val.length} max={MAX} />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const Readonly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'Read-only value',
  },
};

export const WithPrefix: Story = {
  args: {
    prefix: '🔍',
    placeholder: 'Search…',
  },
};

export const WithSuffix: Story = {
  args: {
    suffix: '✓',
    defaultValue: 'Valid value',
  },
};

export const AllInputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['text', 'email', 'url', 'tel', 'number', 'password', 'search', 'date'] as const).map(
        (t) => (
          <div key={t}>
            <label htmlFor={`type-${t}`} style={{ display: 'block', fontSize: '0.875rem', marginBottom: 2 }}>
              type="{t}"
            </label>
            <TextInput id={`type-${t}`} type={t} placeholder={t} />
          </div>
        )
      )}
    </div>
  ),
};

export const NumericInputMode: Story = {
  args: {
    inputMode: 'numeric',
    placeholder: 'Numeric keyboard on mobile',
  },
};