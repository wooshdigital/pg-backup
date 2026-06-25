import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    hasError: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: (args) => (
    <FormField id="story-default" {...args}>
      <Label>Email address</Label>
      <input
        id="story-default"
        type="email"
        placeholder="you@example.com"
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </FormField>
  ),
};

export const WithHelper: Story = {
  render: (args) => (
    <FormField id="story-helper" {...args}>
      <Label>Email address</Label>
      <input
        id="story-helper"
        type="email"
        placeholder="you@example.com"
        aria-describedby="story-helper-helper"
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      <HelperText>We'll never share your email with anyone else.</HelperText>
    </FormField>
  ),
};

export const WithError: Story = {
  args: {
    hasError: true,
  },
  render: (args) => (
    <FormField id="story-error" {...args}>
      <Label>Email address</Label>
      <input
        id="story-error"
        type="email"
        placeholder="you@example.com"
        aria-describedby="story-error-error"
        aria-invalid="true"
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #ef4444',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      <HelperText>We'll never share your email with anyone else.</HelperText>
      <ErrorMessage>Please enter a valid email address.</ErrorMessage>
    </FormField>
  ),
};

export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => (
    <FormField id="story-required" {...args}>
      <Label>Full name</Label>
      <input
        id="story-required"
        type="text"
        placeholder="Jane Doe"
        required
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      <HelperText>Enter your full legal name.</HelperText>
    </FormField>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <FormField id="story-disabled" {...args}>
      <Label>Username</Label>
      <input
        id="story-disabled"
        type="text"
        value="john_doe"
        disabled
        readOnly
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: '#f9fafb',
        }}
      />
      <HelperText>Your username cannot be changed.</HelperText>
    </FormField>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [touched, setTouched] = useState(false);
    const hasError = touched && value.length === 0;

    return (
      <FormField id="story-interactive" hasError={hasError} required>
        <Label>Required field</Label>
        <input
          id="story-interactive"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-describedby={hasError ? 'story-interactive-error' : 'story-interactive-helper'}
          aria-invalid={hasError || undefined}
          required
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '0.375rem',
            fontSize: '1rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <HelperText>This field is required.</HelperText>
        <ErrorMessage>This field cannot be empty.</ErrorMessage>
      </FormField>
    );
  },
};