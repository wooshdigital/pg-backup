import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from './Textarea';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

// ── Mock ResizeObserver ───────────────────────────────────────────────────────

class MockResizeObserver {
  private callback: ResizeObserverCallback;
  static instances: MockResizeObserver[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

beforeEach(() => {
  MockResizeObserver.instances = [];
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderWithFieldCtx(
  ui: React.ReactElement,
  ctx: Partial<React.ContextType<typeof FormFieldContext>> = {}
) {
  const defaultCtx = {
    inputId: 'field-textarea',
    helperId: 'field-helper',
    errorId: 'field-error',
    hasError: false,
    required: false,
    ...ctx,
  };
  return render(
    <FormFieldContext.Provider value={defaultCtx as any}>{ui}</FormFieldContext.Provider>
  );
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('Textarea – rendering', () => {
  it('renders a native textarea element', () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId('ta').tagName).toBe('TEXTAREA');
  });

  it('forwards the ref to the textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('spreads additional HTML attributes', () => {
    render(<Textarea data-testid="ta" placeholder="Write here…" rows={5} />);
    const ta = screen.getByTestId('ta');
    expect(ta).toHaveAttribute('placeholder', 'Write here…');
    expect(ta).toHaveAttribute('rows', '5');
  });
});

// ── ARIA wiring ───────────────────────────────────────────────────────────────

describe('Textarea – ARIA', () => {
  it('auto-wires aria-describedby from context', () => {
    renderWithFieldCtx(<Textarea data-testid="ta" />);
    expect(screen.getByTestId('ta')).toHaveAttribute('aria-describedby', 'field-helper field-error');
  });

  it('merges caller aria-describedby with context ids', () => {
    renderWithFieldCtx(<Textarea data-testid="ta" aria-describedby="extra" />);
    expect(screen.getByTestId('ta')).toHaveAttribute(
      'aria-describedby',
      'field-helper field-error extra'
    );
  });

  it('sets aria-invalid from context hasError', () => {
    renderWithFieldCtx(<Textarea data-testid="ta" />, { hasError: true });
    expect(screen.getByTestId('ta')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid from validationState="error"', () => {
    render(<Textarea data-testid="ta" validationState="error" />);
    expect(screen.getByTestId('ta')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required from context', () => {
    renderWithFieldCtx(<Textarea data-testid="ta" />, { required: true });
    expect(screen.getByTestId('ta')).toHaveAttribute('aria-required', 'true');
  });

  it('uses id from FormFieldContext', () => {
    renderWithFieldCtx(<Textarea data-testid="ta" />);
    expect(screen.getByTestId('ta')).toHaveAttribute('id', 'field-textarea');
  });
});

// ── AutoResize ────────────────────────────────────────────────────────────────

describe('Textarea – autoResize', () => {
  it('does NOT set up ResizeObserver when autoResize=false', () => {
    render(<Textarea data-testid="ta" />);
    expect(MockResizeObserver.instances.length).toBe(0);
  });

  it('sets up a ResizeObserver when autoResize=true', async () => {
    render(<Textarea data-testid="ta" autoResize />);
    await waitFor(() => {
      expect(MockResizeObserver.instances.length).toBeGreaterThan(0);
    });
  });

  it('disconnects ResizeObserver on unmount', async () => {
    const { unmount } = render(<Textarea data-testid="ta" autoResize />);
    await waitFor(() => expect(MockResizeObserver.instances.length).toBeGreaterThan(0));
    const observer = MockResizeObserver.instances[0];
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('calls syncHeight on change when autoResize=true', async () => {
    render(<Textarea data-testid="ta" autoResize minHeight={80} />);
    const ta = screen.getByTestId('ta') as HTMLTextAreaElement;

    // Simulate a scroll height change
    Object.defineProperty(ta, 'scrollHeight', { value: 200, configurable: true });

    await act(async () => {
      fireEvent.change(ta, { target: { value: 'a\nb\nc\nd\ne\nf\ng' } });
    });

    expect(ta.style.height).toBe('200px');
  });

  it('respects maxHeight cap', async () => {
    render(<Textarea data-testid="ta" autoResize minHeight={80} maxHeight={150} />);
    const ta = screen.getByTestId('ta') as HTMLTextAreaElement;
    Object.defineProperty(ta, 'scrollHeight', { value: 300, configurable: true });

    await act(async () => {
      fireEvent.change(ta, { target: { value: 'lots\nof\ncontent' } });
    });

    expect(ta.style.height).toBe('150px');
  });

  it('calls provided onChange handler', () => {
    const onChange = vi.fn();
    render(<Textarea data-testid="ta" autoResize onChange={onChange} />);
    fireEvent.change(screen.getByTestId('ta'), { target: { value: 'hi' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

// ── Controlled ────────────────────────────────────────────────────────────────

describe('Textarea – controlled', () => {
  it('updates value in controlled mode', () => {
    function Controlled() {
      const [val, setVal] = useState('');
      return <Textarea data-testid="ta" value={val} onChange={(e) => setVal(e.target.value)} />;
    }
    render(<Controlled />);
    fireEvent.change(screen.getByTestId('ta'), { target: { value: 'hello' } });
    expect((screen.getByTestId('ta') as HTMLTextAreaElement).value).toBe('hello');
  });
});

// ── Axe accessibility ─────────────────────────────────────────────────────────

describe('Textarea – axe', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="axe-ta">Description</label>
        <Textarea id="axe-ta" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(
      <div>
        <label htmlFor="axe-ta2">Description</label>
        <Textarea id="axe-ta2" validationState="error" aria-describedby="err2" />
        <span id="err2" role="alert">
          Required field
        </span>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});