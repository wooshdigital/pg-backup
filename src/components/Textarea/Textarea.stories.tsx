import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';
import { CharacterCount } from '../TextInput/CharacterCount';
import { FormField } from '../FormField/FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    validationState: {
      control: 'select',
      options: [undefined, 'error', 'success', 'warning'],
    },
    disabled: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    minRows: { control: 'number' },
    maxRows: { control: 'number' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => (
    <FormField>
      <Label>Description</Label>
      <Textarea placeholder="Enter a description…" fullWidth />
    </FormField>
  ),
};

export const AutoResize: Story = {
  render: () => (
    <FormField>
      <Label>Notes</Label>
      <Textarea
        placeholder="Start typing and watch me grow…"
        autoResize
        minRows={2}
        fullWidth
      />
      <HelperText>This textarea grows as you type.</HelperText>
    </FormField>
  ),
};

export const AutoResizeWithMaxRows: Story = {
  render: () => (
    <FormField>
      <Label>Comments</Label>
      <Textarea
        placeholder="Type a long comment…"
        autoResize
        minRows={2}
        maxRows={6}
        fullWidth
      />
      <HelperText>Grows up to 6 rows, then scrolls.</HelperText>
    </FormField>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 280;
    const [value, setValue] = useState('');
    return (
      <FormField>
        <Label>Tweet</Label>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX}
          minRows={3}
          placeholder="What's happening?"
          fullWidth
        />
        <CharacterCount current={value.length} max={MAX} />
      </FormField>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <FormField>
      <Label>Bio</Label>
      <Textarea validationState="error" defaultValue="x" minRows={3} fullWidth />
      <ErrorMessage>Bio must be at least 10 characters.</ErrorMessage>
    </FormField>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <FormField>
      <Label>Bio</Label>
      <Textarea
        validationState="success"
        defaultValue="I am a software developer with 5 years of experience."
        minRows={3}
        fullWidth
      />
      <HelperText>Looks great!</HelperText>
    </FormField>
  ),
};

export const Fixed: Story = {
  render: () => (
    <FormField>
      <Label>Fixed Textarea</Label>
      <Textarea
        placeholder="This textarea cannot be resized."
        style={{ resize: 'none' }}
        minRows={5}
        fullWidth
      />
    </FormField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormField>
      <Label>Notes</Label>
      <Textarea
        defaultValue="This content is read only."
        disabled
        minRows={3}
        fullWidth
      />
    </FormField>
  ),
};