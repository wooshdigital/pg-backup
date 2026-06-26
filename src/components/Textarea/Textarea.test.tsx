import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from './Textarea';
import { FormField } from '../FormField/FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { CharacterCount } from '../TextInput/CharacterCount';

expect.extend(toHaveNoViolations);

// Mock ResizeObserver
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  static instances: MockResizeObserver[] = [];

  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
    MockResizeObserver.instances.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  trigger(entries: ResizeObserverEntry[] = []) {
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

describe('Textarea', () => {
  beforeEach(() => {
    MockResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a native textarea element', () => {
    render(<Textarea aria-label="Message" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards ref to the textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('supports controlled mode', () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="controlled" value="hello" onChange={onChange} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('hello');
    fireEvent.change(textarea, { target: { value: 'world' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports uncontrolled mode', () => {
    render(<Textarea aria-label="uncontrolled" defaultValue="initial" />);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('initial');
  });

  it('applies aria-invalid when validationState is error', () => {
    render(<Textarea aria-label="error" validationState="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('wires aria-describedby from FormFieldContext (helper)', () => {
    render(
      <FormField>
        <Label>Notes</Label>
        <Textarea />
        <HelperText>Add any additional notes here.</HelperText>
      </FormField>
    );
    const textarea = screen.getByRole('textbox');
    const helper = screen.getByText('Add any additional notes here.');
    expect(textarea.getAttribute('aria-describedby')).toContain(helper.id);
  });

  it('wires aria-describedby from FormFieldContext (error)', () => {
    render(
      <FormField error="This field is required">
        <Label>Notes</Label>
        <Textarea />
        <ErrorMessage>This field is required</ErrorMessage>
      </FormField>
    );
    const textarea = screen.getByRole('textbox');
    const errorMsg = screen.getByRole('alert');
    expect(textarea.getAttribute('aria-describedby')).toContain(errorMsg.id);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea aria-label="disabled" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('registers a ResizeObserver when autoResize is enabled', () => {
    render(<Textarea aria-label="auto resize" autoResize />);
    expect(MockResizeObserver.instances).toHaveLength(1);
    expect(MockResizeObserver.instances[0].observe).toHaveBeenCalled();
  });

  it('does not register a ResizeObserver when autoResize is disabled', () => {
    render(<Textarea aria-label="no auto resize" />);
    expect(MockResizeObserver.instances).toHaveLength(0);
  });

  it('disconnects ResizeObserver on unmount', () => {
    const { unmount } = render(<Textarea aria-label="auto resize" autoResize />);
    const observer = MockResizeObserver.instances[0];
    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('adjusts height when content changes in autoResize mode', async () => {
    const user = userEvent.setup();

    // Mock scrollHeight
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 150;
      },
    });

    render(<Textarea aria-label="auto resize" autoResize minHeight={80} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Line 1\nLine 2\nLine 3');
    expect(textarea.style.height).toBe('150px');
  });

  it('respects maxHeight clamp in autoResize mode', async () => {
    const user = userEvent.setup();

    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 400;
      },
    });

    render(<Textarea aria-label="auto resize with max" autoResize minHeight={80} maxHeight={200} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'A'.repeat(200));
    expect(textarea.style.height).toBe('200px');
  });

  it('works with CharacterCount', async () => {
    const user = userEvent.setup();

    function Demo() {
      const [value, setValue] = useState('');
      return (
        <FormField>
          <Label>Bio</Label>
          <Textarea value={value} onChange={e => setValue(e.target.value)} maxLength={200} />
          <CharacterCount current={value.length} max={200} />
        </FormField>
      );
    }

    render(<Demo />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello');
    expect(screen.getByText('195 of 200 characters remaining')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FormField>
        <Label>Message</Label>
        <Textarea placeholder="Type your message…" />
        <HelperText>Maximum 500 characters.</HelperText>
      </FormField>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in error state', async () => {
    const { container } = render(
      <FormField error="Message is required">
        <Label>Message</Label>
        <Textarea />
        <ErrorMessage>Message is required</ErrorMessage>
      </FormField>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});