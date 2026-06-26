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
      options: ['default', 'error', 'success'],
    },
    autoResize: { control: 'boolean' },
    fixed: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-default">Message</Label>
      <Textarea id="ta-default" placeholder="Enter your message…" rows={4} />
    </FormField>
  ),
};

export const AutoResize: Story = {
  render: () => {
    function Example() {
      const [value, setValue] = useState('');
      return (
        <FormField>
          <Label htmlFor="ta-auto">Auto-resize textarea</Label>
          <Textarea
            id="ta-auto"
            autoResize
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Start typing – I'll grow with you…"
          />
          <HelperText id="ta-auto-helper">This textarea grows as you type.</HelperText>
        </FormField>
      );
    }
    return <Example />;
  },
};

export const WithCharCount: Story = {
  render: () => {
    function Example() {
      const [value, setValue] = useState('');
      const MAX = 280;
      return (
        <FormField>
          <Label htmlFor="ta-count">Tweet</Label>
          <Textarea
            id="ta-count"
            autoResize
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={MAX}
            aria-describedby="tweet-count"
            placeholder="What's happening?"
          />
          <CharacterCount id="tweet-count" current={value.length} max={MAX} />
        </FormField>
      );
    }
    return <Example />;
  },
};

export const WithError: Story = {
  render: () => (
    <FormField invalid>
      <Label htmlFor="ta-err" required>
        Description
      </Label>
      <Textarea
        id="ta-err"
        validationState="error"
        defaultValue="Too short"
        rows={3}
      />
      <ErrorMessage id="ta-err-msg">Description must be at least 50 characters.</ErrorMessage>
    </FormField>
  ),
};

export const Fixed: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-fixed">Notes (fixed height)</Label>
      <Textarea
        id="ta-fixed"
        fixed
        rows={6}
        placeholder="Fixed-height textarea, no resize handle."
      />
    </FormField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-disabled">Comments</Label>
      <Textarea
        id="ta-disabled"
        disabled
        value="This textarea is disabled and cannot be edited."
        onChange={() => {}}
        rows={3}
      />
    </FormField>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <FormField>
      <Label htmlFor="ta-success">Bio</Label>
      <Textarea
        id="ta-success"
        validationState="success"
        defaultValue="I'm a software engineer who loves building accessible UIs."
        rows={3}
      />
      <HelperText id="ta-success-helper">Looks great!</HelperText>
    </FormField>
  ),
};