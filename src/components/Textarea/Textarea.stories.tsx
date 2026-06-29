import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';
import { CharacterCount } from '../TextInput/CharacterCount';
import { FormField } from '../FormField';
import { Label } from '../Label';
import { HelperText } from '../HelperText';
import { ErrorMessage } from '../ErrorMessage';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    autoResize: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    placeholder: { control: 'text' },
    minHeight: { control: { type: 'number', min: 40, max: 600 } },
    maxHeight: { control: { type: 'number', min: 100, max: 1200 } },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

// ── Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-default">Description</Label>
      <Textarea id="ta-default" placeholder="Enter a description…" />
    </FormField>
  ),
};

// ── AutoResize ────────────────────────────────────────────────────────────

export const AutoResize: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-auto">Notes (auto-resize)</Label>
      <Textarea
        id="ta-auto"
        autoResize
        minHeight={80}
        maxHeight={400}
        placeholder="Start typing – the textarea grows with your content…"
      />
      <HelperText id="ta-auto-help">This textarea grows as you type, up to 400 px.</HelperText>
    </FormField>
  ),
};

// ── With Character Count ──────────────────────────────────────────────────

export const WithCharCount: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const MAX = 280;
    return (
      <FormField>
        <Label htmlFor="ta-charcount">Tweet</Label>
        <Textarea
          id="ta-charcount"
          autoResize
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX}
          placeholder="What's on your mind?"
        />
        <CharacterCount current={value.length} max={MAX} />
      </FormField>
    );
  },
};

// ── With Error ────────────────────────────────────────────────────────────

export const WithError: Story = {
  render: () => {
    const errorId = 'ta-error-msg';
    return (
      <FormField hasError errorId={errorId}>
        <Label htmlFor="ta-error">Reason for cancellation</Label>
        <Textarea id="ta-error" placeholder="Please provide a reason…" />
        <ErrorMessage id={errorId}>This field is required.</ErrorMessage>
      </FormField>
    );
  },
};

// ── Fixed size ────────────────────────────────────────────────────────────

export const Fixed: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-fixed">Fixed height</Label>
      <Textarea
        id="ta-fixed"
        placeholder="This textarea has a fixed height and scrolls…"
        style={{ height: 160 }}
      />
    </FormField>
  ),
};

// ── Disabled ──────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-disabled">Notes</Label>
      <Textarea id="ta-disabled" disabled defaultValue="Cannot be edited." />
    </FormField>
  ),
};