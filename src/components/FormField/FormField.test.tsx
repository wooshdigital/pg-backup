import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormField } from './FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

expect.extend(toHaveNoViolations);

describe('FormField', () => {
  describe('Accessibility (axe-core)', () => {
    it('has no violations in default state', async () => {
      const { container } = render(
        <FormField id="test-field">
          <Label>Email Address</Label>
          <input id="test-field" type="email" aria-labelledby="test-field-label" />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with helper text', async () => {
      const { container } = render(
        <FormField id="with-helper">
          <Label>Username</Label>
          <input
            id="with-helper"
            type="text"
            aria-labelledby="with-helper-label"
            aria-describedby="with-helper-helper"
          />
          <HelperText>Must be 3–20 characters.</HelperText>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with error message', async () => {
      const { container } = render(
        <FormField id="with-error" hasError>
          <Label>Password</Label>
          <input
            id="with-error"
            type="password"
            aria-labelledby="with-error-label"
            aria-describedby="with-error-error"
            aria-invalid="true"
          />
          <ErrorMessage>Password is required.</ErrorMessage>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations in required state', async () => {
      const { container } = render(
        <FormField id="required-field" required>
          <Label>Full Name</Label>
          <input
            id="required-field"
            type="text"
            aria-labelledby="required-field-label"
            required
          />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations in disabled state', async () => {
      const { container } = render(
        <FormField id="disabled-field" disabled>
          <Label>Phone Number</Label>
          <input
            id="disabled-field"
            type="tel"
            aria-labelledby="disabled-field-label"
            disabled
          />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ID namespacing', () => {
    it('generates stable namespaced IDs from a provided base ID', () => {
      render(
        <FormField id="my-field">
          <Label>My Label</Label>
          <HelperText>My helper</HelperText>
          <ErrorMessage>My error</ErrorMessage>
        </FormField>
      );

      expect(screen.getByText('My Label').id).toBe('my-field-label');
      expect(screen.getByRole('note').id).toBe('my-field-helper');
      expect(screen.getByRole('alert').id).toBe('my-field-error');
    });
  });

  describe('aria-describedby wiring', () => {
    it('helper text has stable ID for aria-describedby', () => {
      render(
        <FormField id="aria-test">
          <Label>Test</Label>
          <HelperText>Hint text</HelperText>
        </FormField>
      );
      const helper = screen.getByRole('note');
      expect(helper).toHaveAttribute('id', 'aria-test-helper');
    });

    it('error message has stable ID for aria-describedby', () => {
      render(
        <FormField id="error-aria-test" hasError>
          <Label>Test</Label>
          <ErrorMessage>Error text</ErrorMessage>
        </FormField>
      );
      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('id', 'error-aria-test-error');
    });
  });

  describe('ErrorMessage alert announcement', () => {
    it('renders with role="alert" for immediate announcement', () => {
      render(
        <FormField id="alert-test" hasError>
          <ErrorMessage>Something went wrong</ErrorMessage>
        </FormField>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Something went wrong');
    });

    it('renders with aria-live="polite"', () => {
      render(
        <FormField id="live-test" hasError>
          <ErrorMessage>Validation error</ErrorMessage>
        </FormField>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Label htmlFor', () => {
    it('label htmlFor is automatically wired to fieldId', () => {
      render(
        <FormField id="label-for-test">
          <Label>My Field</Label>
          <input id="label-for-test" type="text" />
        </FormField>
      );
      const label = screen.getByText('My Field');
      expect(label).toHaveAttribute('for', 'label-for-test');
    });
  });

  describe('HelperText visibility', () => {
    it('is hidden when hasError is true', () => {
      render(
        <FormField id="visibility-test" hasError>
          <HelperText>Helper hint</HelperText>
          <ErrorMessage>Error occurred</ErrorMessage>
        </FormField>
      );
      const helper = screen.getByRole('note', { hidden: true });
      expect(helper).toHaveAttribute('aria-hidden', 'true');
    });

    it('is visible when hasError is false', () => {
      render(
        <FormField id="visibility-test-2">
          <HelperText>Helper hint</HelperText>
        </FormField>
      );
      const helper = screen.getByRole('note');
      expect(helper).not.toHaveAttribute('aria-hidden', 'true');
    });
  });
});