import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormField } from './FormField';
import { Label } from '../Label/Label';
import { HelperText } from '../HelperText/HelperText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { useFormField } from './useFormField';

expect.extend(toHaveNoViolations);

// A simple input that wires up ARIA attributes from context
const TestInput: React.FC = () => {
  const { fieldId, helperId, errorId, hasError } = useFormField();
  const describedBy = hasError ? errorId : helperId;
  return (
    <input
      id={fieldId}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      type="text"
    />
  );
};

describe('FormField', () => {
  describe('Accessibility (axe)', () => {
    it('has no violations in default state', async () => {
      const { container } = render(
        <FormField id="test-field">
          <Label>Name</Label>
          <TestInput />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with helper text', async () => {
      const { container } = render(
        <FormField id="test-field-helper">
          <Label>Email</Label>
          <TestInput />
          <HelperText>Enter your work email address</HelperText>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with error state', async () => {
      const { container } = render(
        <FormField id="test-field-error" hasError>
          <Label>Password</Label>
          <TestInput />
          <ErrorMessage>Password is required</ErrorMessage>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with required field', async () => {
      const { container } = render(
        <FormField id="test-field-required" required>
          <Label>Username</Label>
          <TestInput />
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with disabled field', async () => {
      const { container } = render(
        <FormField id="test-field-disabled" disabled>
          <Label>Bio</Label>
          <input id="test-field-disabled" type="text" disabled aria-describedby="test-field-disabled-helper" />
          <HelperText>Tell us about yourself</HelperText>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with all elements combined', async () => {
      const { container } = render(
        <FormField id="test-field-full" hasError required>
          <Label>Card Number</Label>
          <TestInput />
          <HelperText>16-digit number on the front of your card</HelperText>
          <ErrorMessage>Card number is invalid</ErrorMessage>
        </FormField>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ID namespacing', () => {
    it('generates namespaced IDs for all children', () => {
      render(
        <FormField id="my-field">
          <Label>Test Label</Label>
          <TestInput />
          <HelperText>Helper text</HelperText>
          <ErrorMessage>Error message</ErrorMessage>
        </FormField>
      );

      // Label should be linked via htmlFor to fieldId
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'my-field');
      expect(label).toHaveAttribute('id', 'my-field-label');

      // HelperText should have the helper ID
      const helper = screen.getByRole('note');
      expect(helper).toHaveAttribute('id', 'my-field-helper');

      // ErrorMessage should have the error ID
      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('id', 'my-field-error');
    });
  });

  describe('aria-describedby wiring', () => {
    it('points aria-describedby to helper ID when no error', () => {
      render(
        <FormField id="aria-test">
          <Label>Test</Label>
          <TestInput />
          <HelperText>Some hint</HelperText>
        </FormField>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'aria-test-helper');
    });

    it('points aria-describedby to error ID when hasError is true', () => {
      render(
        <FormField id="aria-error-test" hasError>
          <Label>Test</Label>
          <TestInput />
          <ErrorMessage>Something went wrong</ErrorMessage>
        </FormField>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'aria-error-test-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('ErrorMessage announcement', () => {
    it('renders error message with role="alert" and aria-live="polite"', () => {
      render(
        <FormField id="announcement-test" hasError>
          <Label>Test</Label>
          <TestInput />
          <ErrorMessage>Field is required</ErrorMessage>
        </FormField>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
      expect(alert).toHaveTextContent('Field is required');
    });
  });

  describe('useFormField hook', () => {
    it('throws when used outside FormField', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const BadComponent = () => {
        useFormField();
        return null;
      };
      expect(() => render(<BadComponent />)).toThrow(
        'useFormField must be used within a <FormField> component'
      );
      consoleSpy.mockRestore();
    });

    it('provides correct context values', () => {
      let contextValues: ReturnType<typeof useFormField> | null = null;
      const Inspector: React.FC = () => {
        contextValues = useFormField();
        return null;
      };
      render(
        <FormField id="ctx-test" hasError required disabled>
          <Inspector />
        </FormField>
      );
      expect(contextValues).toMatchObject({
        fieldId: 'ctx-test',
        labelId: 'ctx-test-label',
        helperId: 'ctx-test-helper',
        errorId: 'ctx-test-error',
        hasError: true,
        required: true,
        disabled: true,
      });
    });
  });

  describe('HelperText visibility', () => {
    it('renders helper text with role="note"', () => {
      render(
        <FormField id="helper-vis">
          <HelperText>Helpful hint</HelperText>
        </FormField>
      );
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('hides helper text visually when error is present', () => {
      render(
        <FormField id="helper-hidden" hasError>
          <HelperText>This should be hidden</HelperText>
          <ErrorMessage>Error occurred</ErrorMessage>
        </FormField>
      );
      const helper = screen.getByRole('note');
      // The helper should have aria-hidden when there's an error
      expect(helper).toHaveAttribute('aria-hidden', 'true');
    });
  });
});