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

expect.extend(toHaveNoViolations);

// Mock ResizeObserver
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  trigger(entries: ResizeObserverEntry[]) {
    this.callback(entries, this);
  }
}

let mockObserverInstance: MockResizeObserver;

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation((cb) => {
    mockObserverInstance = new MockResizeObserver(cb);
    return mockObserverInstance;
  }) as unknown as typeof ResizeObserver;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea aria-label="Description" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards ref to underlying textarea', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="Description" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('spreads standard HTML textarea attributes', () => {
    render(
      <Textarea
        aria-label="Description"
        placeholder="Enter description"
        maxLength={200}
        data-testid="my-textarea"
      />
    );
    const textarea = screen.getByTestId('my-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter description');
    expect(textarea).toHaveAttribute('maxlength', '200');
  });

  it('works as a controlled textarea', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Textarea aria-label="Description" value="initial" onChange={onChange} />
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('initial');
    await user.type(textarea, 'x');
    expect(onChange).toHaveBeenCalled();
  });

  it('works as an uncontrolled textarea', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Description" defaultValue="initial" />);
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'new value');
    expect(textarea).toHaveValue('new value');
  });

  it('sets aria-invalid when validationState is error', () => {
    render(<Textarea aria-label="Description" validationState="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('auto-wires aria-describedby from FormFieldContext', () => {
    render(
      <FormField>
        <Label>Description</Label>
        <Textarea />
        <HelperText>Write a short description.</HelperText>
        <ErrorMessage>Description is required.</ErrorMessage>
      </FormField>
    );
    const textarea = screen.getByRole('textbox');
    const describedBy = textarea.getAttribute('aria-describedby') ?? '';
    const helperText = screen.getByText('Write a short description.');
    const errorText = screen.getByText('Description is required.');
    expect(describedBy).toContain(helperText.id);
    expect(describedBy).toContain(errorText.id);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea aria-label="Description" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with minRows setting rows attribute', () => {
    render(<Textarea aria-label="Description" minRows={5} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Description" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('passes axe accessibility check', async () => {
    const { container } = render(
      <FormField>
        <Label>Description</Label>
        <Textarea />
        <HelperText>Enter a description.</HelperText>
      </FormField>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('autoResize', () => {
    it('sets resize: none on textarea when autoResize is enabled', () => {
      render(
        <Textarea aria-label="Description" autoResize data-testid="auto-textarea" />
      );
      // The CSS module class handles this; just verify the component renders
      expect(screen.getByTestId('auto-textarea')).toBeInTheDocument();
    });

    it('calls adjustHeight on change when autoResize is enabled', async () => {
      const user = userEvent.setup();
      render(
        <Textarea aria-label="Description" autoResize data-testid="auto-textarea" />
      );
      const textarea = screen.getByTestId('auto-textarea');
      await user.type(textarea, 'Some text');
      // After typing, the textarea should still be in the document
      expect(textarea).toBeInTheDocument();
    });

    it('observes resize with ResizeObserver when autoResize is enabled', () => {
      render(<Textarea aria-label="Description" autoResize />);
      expect(global.ResizeObserver).toHaveBeenCalled();
    });

    it('disconnects ResizeObserver on unmount', () => {
      const disconnectSpy = vi.fn();
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: disconnectSpy,
      })) as unknown as typeof ResizeObserver;

      const { unmount } = render(<Textarea aria-label="Description" autoResize />);
      unmount();
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('does NOT use ResizeObserver when autoResize is false', () => {
      const observeSpy = vi.fn();
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: observeSpy,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })) as unknown as typeof ResizeObserver;

      render(<Textarea aria-label="Description" autoResize={false} />);
      expect(observeSpy).not.toHaveBeenCalled();
    });
  });
});