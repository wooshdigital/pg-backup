import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from './Textarea';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

function renderWithFieldCtx(
  ui: React.ReactElement,
  ctx: Partial<React.ContextType<typeof FormFieldContext>> = {}
) {
  const defaultCtx = {
    inputId: 'test-textarea',
    helperId: undefined,
    errorId: undefined,
    hasError: false,
    required: false,
    ...ctx,
  };
  return render(
    <FormFieldContext.Provider value={defaultCtx}>
      {ui}
    </FormFieldContext.Provider>
  );
}

// Mock ResizeObserver
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  trigger(entries: ResizeObserverEntry[] = []) {
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

describe('Textarea', () => {
  let originalResizeObserver: typeof ResizeObserver;
  let mockObserverInstance: MockResizeObserver;

  beforeEach(() => {
    originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = vi.fn((cb) => {
      mockObserverInstance = new MockResizeObserver(cb);
      return mockObserverInstance;
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
  });

  it('renders a textarea element', () => {
    render(<Textarea aria-label="Description" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('passes through placeholder', () => {
    render(<Textarea aria-label="Description" placeholder="Write here..." />);
    expect(screen.getByPlaceholderText('Write here...')).toBeInTheDocument();
  });

  it('works in controlled mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <Textarea
          aria-label="controlled"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
        />
      );
    }

    render(<Controlled />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'hello');
    expect(onChange).toHaveBeenCalledTimes(5);
    expect((textarea as HTMLTextAreaElement).value).toBe('hello');
  });

  it('works in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="uncontrolled" defaultValue="" />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'world');
    expect((textarea as HTMLTextAreaElement).value).toBe('world');
  });

  it('wires aria-describedby from FormFieldContext', () => {
    renderWithFieldCtx(<Textarea aria-label="field" />, {
      helperId: 'helper-1',
      errorId: 'error-1',
    });
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-describedby', 'helper-1 error-1');
  });

  it('sets aria-invalid from context hasError', () => {
    renderWithFieldCtx(<Textarea aria-label="field" />, { hasError: true });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required from context', () => {
    renderWithFieldCtx(<Textarea aria-label="field" />, { required: true });
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true'
    );
  });

  it('merges aria-describedby from context and prop', () => {
    renderWithFieldCtx(
      <Textarea aria-label="field" aria-describedby="custom-id" />,
      { helperId: 'helper-1' }
    );
    const textarea = screen.getByRole('textbox');
    const describedBy = textarea.getAttribute('aria-describedby');
    expect(describedBy).toContain('helper-1');
    expect(describedBy).toContain('custom-id');
  });

  it('is disabled when prop is set', () => {
    render(<Textarea aria-label="field" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with minRows', () => {
    render(<Textarea aria-label="field" minRows={5} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(5);
  });

  describe('autoResize', () => {
    it('initialises ResizeObserver when autoResize is true', () => {
      render(<Textarea aria-label="auto" autoResize />);
      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(mockObserverInstance.observe).toHaveBeenCalled();
    });

    it('does not initialise ResizeObserver when autoResize is false', () => {
      render(<Textarea aria-label="no-auto" autoResize={false} />);
      expect(global.ResizeObserver).not.toHaveBeenCalled();
    });

    it('disconnects ResizeObserver on unmount', () => {
      const { unmount } = render(<Textarea aria-label="auto" autoResize />);
      unmount();
      expect(mockObserverInstance.disconnect).toHaveBeenCalled();
    });

    it('does not set rows attribute when autoResize is true', () => {
      render(<Textarea aria-label="auto" autoResize minRows={3} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      // rows should not be set (undefined -> 0 default)
      expect(textarea.getAttribute('rows')).toBeNull();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="desc-textarea">Description</label>
        <Textarea id="desc-textarea" placeholder="Enter description" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in error state', async () => {
    const { container } = render(
      <div>
        <label htmlFor="err-textarea">Notes</label>
        <Textarea
          id="err-textarea"
          aria-invalid={true}
          aria-describedby="err-msg"
          validationState="error"
        />
        <span id="err-msg" role="alert">
          This field is required.
        </span>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});