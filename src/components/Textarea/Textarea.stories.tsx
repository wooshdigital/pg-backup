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
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => (
    <FormField>
      <Label>Message</Label>
      <Textarea placeholder="Type your message here…" />
    </FormField>
  ),
};

export const AutoResize: Story = {
  render: () => (
    <FormField>
      <Label>Auto-resizing textarea</Label>
      <Textarea
        autoResize
        minHeight={80}
        placeholder="Start typing — I'll grow with you…"
      />
      <HelperText>This textarea grows as you type.</HelperText>
    </FormField>
  ),
};

export const WithCharCount: Story = {
  render: () => {
    const MAX = 200;
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <FormField>
          <Label>Bio</Label>
          <Textarea
            autoResize
            minHeight={100}
            maxHeight={300}
            value={value}
            onChange={e => setValue(e.target.value)}
            maxLength={MAX}
            placeholder="Tell us about yourself…"
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <HelperText>Keep it concise.</HelperText>
            <CharacterCount current={value.length} max={MAX} />
          </div>
        </FormField>
      );
    }
    return <Demo />;
  },
};

export const WithError: Story = {
  render: () => (
    <FormField error="Message cannot be empty.">
      <Label>Message</Label>
      <Textarea placeholder="Type your message…" />
      <ErrorMessage>Message cannot be empty.</ErrorMessage>
    </FormField>
  ),
};

export const Fixed: Story = {
  render: () => (
    <FormField>
      <Label>Fixed-size notes</Label>
      <Textarea
        style={{ height: 160, resize: 'none' }}
        placeholder="This textarea has a fixed size and no resize handle."
      />
    </FormField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormField>
      <Label>Notes (read-only)</Label>
      <Textarea disabled defaultValue="This field is disabled and cannot be edited." />
    </FormField>
  ),
};