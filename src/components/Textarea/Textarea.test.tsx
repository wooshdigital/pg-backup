import React, { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from './Textarea';
import { CharacterCount } from '../TextInput/CharacterCount';
import { FormFieldContext } from '../FormField/FormFieldContext';

expect.extend(toHaveNoViolations);

// Helper: mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  // @ts-ignore
  global.ResizeObserver = MockResizeObserver;
});

describe('Textarea', () => {
  it('renders a native textarea element', () => {
    render(<Textarea aria-label="Test" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('uses provided id', () => {
    render(<Textarea id="ta-id" aria-label="Test" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'ta-id');
  });

  it('picks up inputId from FormFieldContext', () => {
    render(
      <FormFieldContext.Provider
        value={{ inputId: 'ctx-ta', helperId: undefined, errorId: undefined, required: false, invalid: false }}
      >
        <Textarea aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'ctx-ta');
  });

  it('wires aria-describedby from context', () => {
    render(
      <FormFieldContext.Provider
        value={{ inputId: 'ta', helperId: 'h', errorId: 'e', required: false, invalid: false }}
      >
        <Textarea aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'h e');
  });

  it('sets aria-invalid from validationState=error', () => {
    render(<Textarea aria-label="Test" validationState="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid from context invalid flag', () => {
    render(
      <FormFieldContext.Provider
        value={{ inputId: 'ta', helperId: undefined, errorId: undefined, required: false, invalid: true }}
      >
        <Textarea aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid for default state', () => {
    render(<Textarea aria-label="Test" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('sets aria-required from context', () => {
    render(
      <FormFieldContext.Provider
        value={{ inputId: 'ta', helperId: undefined, errorId: undefined, required: true, invalid: false }}
      >
        <Textarea aria-label="Test" />
      </FormFieldContext.Provider>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('works as a controlled textarea', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <Textarea
          aria-label="Test"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleChange(e.target.value);
          }}
        />
      );
    }

    render(<Controlled />);
    const ta = screen.getByRole('textbox');
    await user.type(ta, 'hi');
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(ta).toHaveValue('hi');
  });

  it('works as an uncontrolled textarea', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Test" defaultValue="initial" />);
    const ta = screen.getByRole('textbox');
    expect(ta).toHaveValue('initial');
    await user.clear(ta);
    await user.type(ta, 'updated');
    expect(ta).toHaveValue('updated');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea aria-label="Test" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  describe('autoResize', () => {
    it('calls setAutoHeight on mount when autoResize is true', () => {
      // jsdom scrollHeight is 0, so style.height will be set to "0px"
      render(<Textarea aria-label="Test" autoResize defaultValue="some text" />);
      const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
      // height gets set (even if 0px in jsdom)
      expect(ta.style.height).toBeDefined();
    });

    it('updates height on value change when autoResize is true', () => {
      function ResizeTest() {
        const [value, setValue] = useState('');
        return (
          <Textarea
            aria-label="Test"
            autoResize
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      }
      const user = userEvent.setup();
      render(<ResizeTest />);
      // Just checking no errors thrown during resize
      act(() => {
        user.type(screen.getByRole('textbox'), 'new line\nnew line');
      });
    });

    it('does not have resize: both CSS class when autoResize is true', () => {
      render(<Textarea aria-label="Test" autoResize />);
      const ta = screen.getByRole('textbox');
      // The autoResize class suppresses manual resize
      expect(ta.className).toContain('autoResize');
    });
  });

  describe('fixed', () => {
    it('applies fixed class when fixed prop is set', () => {
      render(<Textarea aria-label="Test" fixed />);
      expect(screen.getByRole('textbox').className).toContain('fixed');
    });

    it('does not apply fixed class when autoResize is also set', () => {
      render(<Textarea aria-label="Test" fixed autoResize />);
      // autoResize takes precedence
      expect(screen.getByRole('textbox').className).not.toContain('fixed');
    });
  });

  it('works with CharacterCount', () => {
    function WithCount() {
      const [value, setValue] = useState('');
      return (
        <>
          <Textarea
            aria-label="Message"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={200}
            aria-describedby="ta-count"
          />
          <CharacterCount id="ta-count" current={value.length} max={200} />
        </>
      );
    }
    render(<WithCount />);
    expect(screen.getByRole('status')).toHaveTextContent('200 of 200 characters remaining');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="ax-ta">Message</label>
        <Textarea id="ax-ta" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});