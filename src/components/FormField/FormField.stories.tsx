import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

// ---------------------------------------------------------------------------
// Shared input style
// ---------------------------------------------------------------------------
const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.375rem',
  border: '1px solid #d1d5db',
  fontSize: '0.875rem',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid #dc2626',
};

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------
export const Default: Story = {
  render: () => (
    <FormField id="story-default" style={{ maxWidth: '24rem' }}>
      <Label>Email address</Label>
      <input
        id="story-default"
        type="email"
        placeholder="you@example.com"
        style={inputStyle}
        aria-labelledby="story-default-label"
        aria-describedby="story-default-helper"
      />
      <HelperText>We'll never share your email with anyone.</HelperText>
    </FormField>
  ),
};

// ---------------------------------------------------------------------------
// WithHelper
// ---------------------------------------------------------------------------
export const WithHelper: Story = {
  render: () => (
    <FormField id="story-helper" style={{ maxWidth: '24rem' }}>
      <Label>Username</Label>
      <input
        id="story-helper"
        type="text"
        placeholder="john_doe"
        style={inputStyle}
        aria-labelledby="story-helper-label"
        aria-describedby="story-helper-helper"
      />
      <HelperText>
        3–20 characters. Letters, numbers, and underscores only.
      </HelperText>
    </FormField>
  ),
};

// ---------------------------------------------------------------------------
// WithError
// ---------------------------------------------------------------------------
export const WithError: Story = {
  render: () => (
    <FormField id="story-error" hasError style={{ maxWidth: '24rem' }}>
      <Label>Email address</Label>
      <input
        id="story-error"
        type="email"
        defaultValue="not-an-email"
        style={errorInputStyle}
        aria-labelledby="story-error-label"
        aria-describedby="story-error-error"
        aria-invalid="true"
      />
      <HelperText>We'll never share your email with anyone.</HelperText>
      <ErrorMessage>Please enter a valid email address.</ErrorMessage>
    </FormField>
  ),
};

// ---------------------------------------------------------------------------
// Required
// ---------------------------------------------------------------------------
export const Required: Story = {
  render: () => (
    <FormField id="story-required" required style={{ maxWidth: '24rem' }}>
      <Label>Full name</Label>
      <input
        id="story-required"
        type="text"
        placeholder="Jane Doe"
        style={inputStyle}
        aria-labelledby="story-required-label"
        aria-describedby="story-required-helper"
        aria-required="true"
      />
      <HelperText>As it appears on your government-issued ID.</HelperText>
    </FormField>
  ),
};

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------
export const Disabled: Story = {
  render: () => (
    <FormField id="story-disabled" disabled style={{ maxWidth: '24rem' }}>
      <Label>Email address</Label>
      <input
        id="story-disabled"
        type="email"
        defaultValue="locked@example.com"
        style={{ ...inputStyle, backgroundColor: '#f3f4f6' }}
        aria-labelledby="story-disabled-label"
        aria-describedby="story-disabled-helper"
        aria-disabled="true"
        readOnly
      />
      <HelperText>This field cannot be changed.</HelperText>
    </FormField>
  ),
};

// ---------------------------------------------------------------------------
// RequiredWithError
// ---------------------------------------------------------------------------
export const RequiredWithError: Story = {
  name: 'Required + Error',
  render: () => (
    <FormField
      id="story-req-err"
      required
      hasError
      style={{ maxWidth: '24rem' }}
    >
      <Label>Password</Label>
      <input
        id="story-req-err"
        type="password"
        style={errorInputStyle}
        aria-labelledby="story-req-err-label"
        aria-describedby="story-req-err-error"
        aria-invalid="true"
        aria-required="true"
      />
      <HelperText>Must be at least 8 characters.</HelperText>
      <ErrorMessage>Password is required.</ErrorMessage>
    </FormField>
  ),
};