import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';
import { CharacterCount } from './CharacterCount';
import { FormField } from '../FormField';
import { Label } from '../Label';
import { HelperText } from '../HelperText';
import { ErrorMessage } from '../ErrorMessage';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof TextInput>;

// ── Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    placeholder: 'Enter text…',
    'aria-label': 'Text field',
  },
};

// ── With Label ────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="field-label">Full name</Label>
      <TextInput id="field-label" placeholder="Jane Doe" />
    </FormField>
  ),
};

// ── With Helper Text ──────────────────────────────────────────────────────

export const WithHelper: Story = {
  render: () => {
    const helperId = 'helper-1';
    return (
      <FormField helperId={helperId}>
        <Label htmlFor="field-helper">Username</Label>
        <TextInput id="field-helper" placeholder="johndoe" />
        <HelperText id={helperId}>Must be unique across the platform.</HelperText>
      </FormField>
    );
  },
};

// ── With Error ────────────────────────────────────────────────────────────

export const WithError: Story = {
  render: () => {
    const errorId = 'error-1';
    return (
      <FormField hasError errorId={errorId}>
        <Label htmlFor="field-error">Email</Label>
        <TextInput id="field-error" type="email" placeholder="you@example.com" />
        <ErrorMessage id={errorId}>Please enter a valid email address.</ErrorMessage>
      </FormField>
    );
  },
};

// ── With Character Count ──────────────────────────────────────────────────

export const WithCharCount: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const MAX = 140;
    return (
      <FormField>
        <Label htmlFor="field-charcount">Bio</Label>
        <TextInput
          id="field-charcount"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX}
          placeholder="Tell us about yourself…"
        />
        <CharacterCount current={value.length} max={MAX} />
      </FormField>
    );
  },
};

// ── Disabled ──────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    placeholder: 'Cannot edit',
    'aria-label': 'Disabled field',
    disabled: true,
    defaultValue: 'Disabled value',
  },
};

// ── Readonly ──────────────────────────────────────────────────────────────

export const Readonly: Story = {
  args: {
    'aria-label': 'Readonly field',
    readOnly: true,
    defaultValue: 'Read-only value',
  },
};

// ── With Prefix Icon ──────────────────────────────────────────────────────

export const WithPrefixIcon: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="field-prefix">Search</Label>
      <TextInput
        id="field-prefix"
        placeholder="Search…"
        prefix={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        }
      />
    </FormField>
  ),
};

// ── With Suffix Icon ──────────────────────────────────────────────────────

export const WithSuffixIcon: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="field-suffix">Password</Label>
      <TextInput
        id="field-suffix"
        type="password"
        placeholder="••••••••"
        suffix={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      />
    </FormField>
  ),
};

// ── All Input Types ───────────────────────────────────────────────────────

export const AllInputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['text', 'email', 'url', 'tel', 'number', 'password', 'search', 'date'] as const).map(
        (type) => (
          <FormField key={type}>
            <Label htmlFor={`type-${type}`}>{type}</Label>
            <TextInput id={`type-${type}`} type={type} placeholder={`type="${type}"`} />
          </FormField>
        ),
      )}
    </div>
  ),
};