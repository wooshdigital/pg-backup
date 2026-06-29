import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';
import { CharacterCount } from '../TextInput/CharacterCount';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    validationState: {
      control: 'select',
      options: ['none', 'error', 'success', 'warning'],
    },
    autoResize: { control: 'boolean' },
    disabled: { control: 'boolean' },
    minRows: { control: { type: 'number', min: 1, max: 20 } },
    maxRows: { control: { type: 'number', min: 1, max: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
    'aria-label': 'Message',
    minRows: 4,
  },
};

export const Fixed: Story = {
  args: {
    placeholder: 'Fixed height textarea (no resize)...',
    'aria-label': 'Fixed textarea',
    minRows: 6,
    style: { resize: 'none' },
  },
};

export const AutoResize: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label
          htmlFor="auto-resize-ta"
          style={{ fontWeight: 500, fontSize: 14 }}
        >
          Auto-resizing Textarea
        </label>
        <Textarea
          id="auto-resize-ta"
          autoResize
          minRows={2}
          maxRows={10}
          placeholder="Start typing, I'll grow with you..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          Grows up to 10 rows, then scrolls.
        </span>
      </div>
    );
  },
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 300;
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label
          htmlFor="char-count-ta"
          style={{ fontWeight: 500, fontSize: 14 }}
        >
          Bio (300 characters max)
        </label>
        <Textarea
          id="char-count-ta"
          maxLength={MAX}
          minRows={4}
          placeholder="Tell us about yourself..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <CharacterCount current={value.length} max={MAX} />
        </div>
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor="err-ta" style={{ fontWeight: 500, fontSize: 14 }}>
        Description
      </label>
      <Textarea
        id="err-ta"
        validationState="error"
        aria-invalid={true}
        aria-describedby="err-ta-msg"
        defaultValue="Too short."
        minRows={4}
      />
      <span id="err-ta-msg" style={{ color: '#ef4444', fontSize: 13 }}>
        Description must be at least 50 characters.
      </span>
    </div>
  ),
};

export const AutoResizeWithCharCount: Story = {
  render: () => {
    const MAX = 500;
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label
          htmlFor="auto-charcount-ta"
          style={{ fontWeight: 500, fontSize: 14 }}
        >
          Notes
        </label>
        <Textarea
          id="auto-charcount-ta"
          autoResize
          minRows={2}
          maxRows={15}
          maxLength={MAX}
          placeholder="Write your notes here..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CharacterCount current={value.length} max={MAX} />
        </div>
      </div>
    );
  },
};