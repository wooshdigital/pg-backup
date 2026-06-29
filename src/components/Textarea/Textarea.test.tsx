import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from './Textarea';
import { CharacterCount } from '../TextInput/CharacterCount';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

// ResizeObserver mock
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

  describe('Rendering', () => {
    it('renders a textarea element', () => {
      render(<Textarea id="ta" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('forwards ref to the textarea element', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} id="ta" />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('spreads extra props onto the native textarea', () => {
      render(<Textarea id="ta" placeholder="Write here…" data-testid="my-ta" />);
      expect(screen.getByTestId('my-ta')).toHaveAttribute('placeholder', 'Write here…');
    });

    it('renders prefix and suffix', () => {
      render(<Textarea id="ta" prefix={<span>P</span>} suffix={<span>S</span>} />);
      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
    });
  });

  describe('ARIA wiring', () => {
    it('wires aria-describedby from FormFieldContext', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'ta', helperId: 'h1', errorId: 'e1', hasError: false, required: false }}
        >
          <Textarea id="ta" />
        </FormFieldContext.Provider>
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'h1 e1');
    });

    it('sets aria-invalid from context hasError', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'ta', helperId: undefined, errorId: 'e1', hasError: true, required: false }}
        >
          <Textarea id="ta" />
        </FormFieldContext.Provider>
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-required from context required', () => {
      render(
        <FormFieldContext.Provider
          value={{ inputId: 'ta', helperId: undefined, errorId: undefined, hasError: false, required: true }}
        >
          <Textarea id="ta" />
        </FormFieldContext.Provider>
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Controlled / Uncontrolled', () => {
    it('reflects controlled value', () => {
      render(<Textarea id="ta" value="hello" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('hello');
    });

    it('accepts defaultValue in uncontrolled mode', () => {
      render(<Textarea id="ta" defaultValue="preset" />);
      expect(screen.getByRole('textbox')).toHaveValue('preset');
    });

    it('calls onChange on input', async () => {
      const onChange = vi.fn();
      render(<Textarea id="ta" value="" onChange={onChange} />);
      await userEvent.type(screen.getByRole('textbox'), 'x');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('AutoResize', () => {
    it('does not set up ResizeObserver when autoResize is false', () => {
      render(<Textarea id="ta" autoResize={false} />);
      expect(MockResizeObserver.instances.length).toBe(0);
    });

    it('sets up ResizeObserver when autoResize is true', () => {
      render(<Textarea id="ta" autoResize={true} />);
      expect(MockResizeObserver.instances.length).toBeGreaterThan(0);
      expect(MockResizeObserver.instances[0].observe).toHaveBeenCalled();
    });

    it('disconnects ResizeObserver on unmount', () => {
      const { unmount } = render(<Textarea id="ta" autoResize={true} />);
      const observer = MockResizeObserver.instances[0];
      unmount();
      expect(observer.disconnect).toHaveBeenCalled();
    });

    it('applies resize:none style when autoResize is true', () => {
      render(<Textarea id="ta" autoResize={true} data-testid="ta" />);
      const ta = screen.getByTestId('ta') as HTMLTextAreaElement;
      expect(ta.style.resize).toBe('none');
    });

    it('sets min-height from minRows', () => {
      render(<Textarea id="ta" autoResize={true} minRows={5} data-testid="ta" />);
      const ta = screen.getByTestId('ta') as HTMLTextAreaElement;
      // 5 rows * 24px + 16px padding = 136px
      expect(ta.style.minHeight).toBe('136px');
    });
  });

  describe('Disabled and readonly', () => {
    it('is disabled when disabled prop passed', () => {
      render(<Textarea id="ta" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('is readonly when readOnly prop passed', () => {
      render(<Textarea id="ta" readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });

  describe('With CharacterCount', () => {
    it('updates character count as user types', async () => {
      function Controlled() {
        const [val, setVal] = useState('');
        return (
          <>
            <label htmlFor="ta">Comment</label>
            <Textarea id="ta" value={val} onChange={(e) => setVal(e.target.value)} maxLength={200} />
            <CharacterCount current={val.length} max={200} />
          </>
        );
      }
      render(<Controlled />);
      await userEvent.type(screen.getByRole('textbox'), 'Hello');
      expect(screen.getByRole('status')).toHaveTextContent('195 of 200 characters remaining');
    });
  });

  describe('Accessibility (axe)', () => {
    it('passes axe with a label', async () => {
      const { container } = render(
        <div>
          <label htmlFor="axe-ta">Description</label>
          <Textarea id="axe-ta" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe in error state', async () => {
      const { container } = render(
        <div>
          <label htmlFor="axe-err-ta">Description</label>
          <Textarea
            id="axe-err-ta"
            validationState="error"
            aria-invalid={true}
            aria-describedby="ta-err"
          />
          <span id="ta-err" role="alert">Too short</span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});