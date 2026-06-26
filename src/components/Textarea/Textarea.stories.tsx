import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';
import { CharacterCount } from '../TextInput/CharacterCount';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 400, fontFamily: 'system-ui, sans-serif' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div>
      <label htmlFor="ta-default" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
        Description
      </label>
      <Textarea id="ta-default" placeholder="Enter a description…" rows={4} />
    </div>
  ),
};

export const AutoResize: Story = {
  render: () => {
    const [val, setVal] = useState('');
    return (
      <div>
        <label htmlFor="ta-auto" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
          Auto-resize textarea (type to expand)
        </label>
        <Textarea
          id="ta-auto"
          autoResize
          minHeight={80}
          maxHeight={300}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Start typing to see me grow…"
        />
      </div>
    );
  },
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 280;
    const [val, setVal] = useState('');
    return (
      <div>
        <label htmlFor="ta-charcount" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
          Tweet-length note
        </label>
        <Textarea
          id="ta-charcount"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          maxLength={MAX}
          rows={4}
          aria-describedby="ta-cc"
        />
        <CharacterCount id="ta-cc" current={val.length} max={MAX} warningThreshold={80} />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div>
      <label htmlFor="ta-error" style={{ display: 'block', marginBottom: 4 }}>
        Comments
      </label>
      <Textarea id="ta-error" validationState="error" aria-describedby="ta-err-msg" rows={3} />
      <span id="ta-err-msg" role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>
        This field is required.
      </span>
    </div>
  ),
};

export const Fixed: Story = {
  render: () => (
    <div>
      <label htmlFor="ta-fixed" style={{ display: 'block', marginBottom: 4 }}>
        Fixed-size textarea
      </label>
      <Textarea id="ta-fixed" rows={6} style={{ resize: 'none' }} placeholder="Cannot resize this…" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div>
      <label htmlFor="ta-disabled" style={{ display: 'block', marginBottom: 4 }}>
        Disabled
      </label>
      <Textarea id="ta-disabled" disabled defaultValue="This content is read-only." rows={3} />
    </div>
  ),
};