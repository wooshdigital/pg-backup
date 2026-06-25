import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormField } from './FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

expect.extend(toHaveNoViolations);

describe('FormField', () => {
  describe('axe accessibility', () => {
    it('has no violations in default state', async () => {
      const { container } = render(
        <FormField id="test-field">
          <Label>Email address</Label>
          <input id="test-field" type="email" aria-labelledby="test-field-label" />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with helper text', async () => {
      const { container } = render(
        <FormField id="test-field">
          <Label>Email address</Label>
          <input
            id="test-field"
            type="email"
            aria-labelledby="test-field-label"
            aria-describedby="test-field-helper"
          />
          <HelperText>We'll never share your email.</HelperText>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations in error state', async () => {
      const { container } = render(
        <FormField id="test-field" hasError>
          <Label>Email address</Label>
          <input
            id="test-field"
            type="email"
            aria-labelledby="test-field-label"
            aria-describedby="test-field-error"
            aria-invalid="true"
          />
          <ErrorMessage>Please enter a valid email address.</ErrorMessage>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations in required state', async () => {
      const { container } = render(
        <FormField id="test-field" required>
          <Label>Email address</Label>
          <input
            id="test-field"
            type="email"
            aria-labelledby="test-field-label"
            required
          />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations in disabled state', async () => {
      const { container } = render(
        <FormField id="test-field" disabled>
          <Label>Email address</Label>
          <input
            id="test-field"
            type="email"
            aria-labelledby="test-field-label"
            disabled
          />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ID namespacing', () => {
    it('provides correct namespaced IDs through context', () => {
      let capturedIds: { labelId?: string; helperId?: string; errorId?: string } = {};

      const TestConsumer: React.FC = () => {
        const { labelId, helperId, errorId } = require('./useFormField').useFormField();
        capturedIds = { labelId, helperId, errorId };
        return null;
      };

      render(
        <FormField id="my-field">
          <TestConsumer />
        </FormField>
      );

      expect(capturedIds.labelId).toBe('my-field-label');
      expect(capturedIds.helperId).toBe('my-field-helper');
      expect(capturedIds.errorId).toBe('my-field-error');
    });
  });

  describe('aria-describedby wiring', () => {
    it('HelperText renders with correct stable ID', () => {
      render(
        <FormField id="field-1">
          <HelperText>Helper content</HelperText>
        </FormField>
      );
      const helperEl = screen.getByRole('note');
      expect(helperEl).toHaveAttribute('id', 'field-1-helper');
    });

    it('ErrorMessage renders with correct stable ID', () => {
      render(
        <FormField id="field-2" hasError>
          <ErrorMessage>Error content</ErrorMessage>
        </FormField>
      );
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toHaveAttribute('id', 'field-2-error');
    });

    it('HelperText is hidden when error is present', () => {
      render(
        <FormField id="field-3" hasError>
          <HelperText>Helper content</HelperText>
          <ErrorMessage>Error content</ErrorMessage>
        </FormField>
      );
      const helperEl = screen.getByRole('note', { hidden: true });
      expect(helperEl).toHaveAttribute('aria-hidden', 'true');
    });

    it('HelperText is visible when no error', () => {
      render(
        <FormField id="field-4">
          <HelperText>Helper content</HelperText>
        </FormField>
      );
      const helperEl = screen.getByRole('note');
      expect(helperEl).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('ErrorMessage announcement', () => {
    it('renders with role=alert and aria-live=polite', () => {
      render(
        <FormField id="field-5" hasError>
          <ErrorMessage>Validation failed</ErrorMessage>
        </FormField>
      );
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toHaveAttribute('aria-live', 'polite');
    });

    it('ErrorMessage is not rendered when no error', () => {
      render(
        <FormField id="field-6">
          <ErrorMessage>This should be hidden</ErrorMessage>
        </FormField>
      );
      const errorEl = screen.queryByRole('alert');
      expect(errorEl).toBeNull();
    });
  });

  describe('Label', () => {
    it('renders label with correct htmlFor from context', () => {
      render(
        <FormField id="field-7">
          <Label>My Label</Label>
          <input id="field-7" type="text" />
        </FormField>
      );
      const labelEl = screen.getByText('My Label');
      expect(labelEl.tagName).toBe('LABEL');
      expect(labelEl).toHaveAttribute('for', 'field-7');
      expect(labelEl).toHaveAttribute('id', 'field-7-label');
    });

    it('renders required asterisk when required', () => {
      render(
        <FormField id="field-8" required>
          <Label>Required Field</Label>
          <input id="field-8" type="text" required />
        </FormField>
      );
      const asterisk = screen.getByLabelText('required');
      expect(asterisk).toBeInTheDocument();
    });
  });

  describe('useFormField hook', () => {
    it('throws when used outside of FormField', () => {
      const { useFormField } = require('./useFormField');
      const TestComponent: React.FC = () => {
        useFormField();
        return null;
      };

      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TestComponent />)).toThrow(
        'useFormField must be used within a <FormField> component.'
      );
      spy.mockRestore();
    });
  });
});