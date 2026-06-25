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
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

const InputField: React.FC<{ id: string; type?: string; disabled?: boolean }> = ({
  id,
  type = 'text',
  disabled,
}) => (
  <input
    id={id}
    type={type}
    disabled={disabled}
    style={{
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      outline: 'none',
    }}
  />
);

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <FormField id="default-field">
        <Label>Email Address</Label>
        <InputField id="default-field" type="email" />
      </FormField>
    </div>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <FormField id="helper-field">
        <Label>Username</Label>
        <InputField id="helper-field" />
        <HelperText>Must be 3–20 characters. Letters, numbers, and underscores only.</HelperText>
      </FormField>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <FormField id="error-field" hasError>
        <Label>Password</Label>
        <InputField id="error-field" type="password" />
        <HelperText>Must be at least 8 characters.</HelperText>
        <ErrorMessage>Password must be at least 8 characters long.</ErrorMessage>
      </FormField>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <FormField id="required-field" required>
        <Label>Full Name</Label>
        <InputField id="required-field" />
        <HelperText>Enter your first and last name.</HelperText>
      </FormField>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <FormField id="disabled-field" disabled>
        <Label>Account ID</Label>
        <InputField id="disabled-field" disabled />
        <HelperText>Your account ID cannot be changed.</HelperText>
      </FormField>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const hasError = value.length > 0 && value.length < 3;

    return (
      <div style={{ width: 320 }}>
        <FormField id="interactive-field" hasError={hasError} required>
          <Label>Display Name</Label>
          <input
            id="interactive-field"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={hasError}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
          />
          <HelperText>Must be at least 3 characters.</HelperText>
          {hasError && <ErrorMessage>Display name is too short.</ErrorMessage>}
        </FormField>
      </div>
    );
  },
};