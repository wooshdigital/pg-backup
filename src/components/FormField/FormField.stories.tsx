import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { useFormField } from './useFormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormField>;

// Reusable wired input for stories
const WiredInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const { fieldId, helperId, errorId, hasError, disabled } = useFormField();
  const describedBy = hasError ? errorId : helperId;
  return (
    <input
      id={fieldId}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      disabled={disabled}
      type="text"
      style={{
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: `1px solid ${hasError ? 'var(--color-error, #dc2626)' : 'var(--color-border, #d1d5db)'}`,
        borderRadius: '0.375rem',
        fontSize: '1rem',
        lineHeight: '1.5',
        outline: 'none',
        boxSizing: 'border-box',
      }}
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => (
    <FormField id="story-default">
      <Label>Full Name</Label>
      <WiredInput placeholder="Jane Doe" />
    </FormField>
  ),
};

export const WithHelper: Story = {
  render: () => (
    <FormField id="story-helper">
      <Label>Email Address</Label>
      <WiredInput placeholder="jane@example.com" type="email" />
      <HelperText>We'll never share your email with anyone else.</HelperText>
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField id="story-error" hasError>
      <Label>Password</Label>
      <WiredInput type="password" defaultValue="abc" />
      <HelperText>Must be at least 8 characters.</HelperText>
      <ErrorMessage>Password must be at least 8 characters.</ErrorMessage>
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField id="story-required" required>
      <Label>Username</Label>
      <WiredInput placeholder="johndoe" />
      <HelperText>Only letters, numbers, and underscores.</HelperText>
    </FormField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormField id="story-disabled" disabled>
      <Label>Account ID</Label>
      <WiredInput defaultValue="ACC-00421" />
      <HelperText>This field cannot be changed.</HelperText>
    </FormField>
  ),
};

export const RequiredWithError: Story = {
  render: () => (
    <FormField id="story-required-error" required hasError>
      <Label>Credit Card Number</Label>
      <WiredInput placeholder="1234 5678 9012 3456" />
      <HelperText>16-digit number on the front of your card.</HelperText>
      <ErrorMessage>Please enter a valid card number.</ErrorMessage>
    </FormField>
  ),
};