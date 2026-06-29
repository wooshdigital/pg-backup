import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';
import { CharacterCount } from '../TextInput/CharacterCount';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    validationState: {
      control: { type: 'select' },
      options: [undefined, 'error', 'success', 'warning'],
    },
    autoResize: {
      control: 'boolean',
    },
    minRows: {
      control: { type: 'number', min: 1, max: 20 },
    },
    maxRows: {
      control: { type: 'number', min: 1, max: 50 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <label htmlFor="default-ta" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Description
      </label>
      <Textarea id="default-ta" placeholder="Enter a description…" rows={4} />
    </div>
  ),
};

export const AutoResize: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <label htmlFor="autoresize-ta" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Auto-resizing textarea
      </label>
      <Textarea
        id="autoresize-ta"
        placeholder="Start typing and the box will grow…"
        autoResize
        minRows={3}
        maxRows={10}
      />
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 4 }}>
        Height grows to fit content, capped at 10 rows.
      </p>
    </div>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 300;
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 400 }}>
        <label htmlFor="charcount-ta" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          Bio
        </label>
        <Textarea
          id="charcount-ta"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoResize
          minRows={3}
          maxRows={8}
          maxLength={MAX}
          aria-describedby="ta-char-count"
        />
        <CharacterCount id="ta-char-count" current={value.length} max={MAX} />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <label htmlFor="error-ta" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Feedback
      </label>
      <Textarea
        id="error-ta"
        defaultValue="Too short."
        validationState="error"
        aria-invalid={true}
        aria-describedby="ta-error-msg"
        rows={4}
      />
      <span id="ta-error-msg" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: 4, display: 'block' }}>
        Feedback must be at least 50 characters.
      </span>
    </div>
  ),
};

export const Fixed: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <label htmlFor="fixed-ta" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Notes (fixed size)
      </label>
      <Textarea
        id="fixed-ta"
        placeholder="This textarea has a fixed size with a native resize handle."
        rows={5}
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <label htmlFor="disabled-ta" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        Comments (locked)
      </label>
      <Textarea id="disabled-ta" defaultValue="This content cannot be edited." rows={3} disabled />
    </div>
  ),
};