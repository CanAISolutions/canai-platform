import { useState, useCallback } from 'react';

export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => string | null;
};

export type ValidationState = 'idle' | 'validating' | 'success' | 'error';

export interface FieldValidation {
  value: string;
  error: string | null;
  state: ValidationState;
  touched: boolean;
}

export const useFormValidation = (fields: Record<string, ValidationRule>) => {
  const [validations, setValidations] = useState<
    Record<string, FieldValidation>
  >(
    Object.keys(fields).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          value: '',
          error: null,
          state: 'idle' as ValidationState,
          touched: false,
        },
      }),
      {}
    )
  );

  const validateField = useCallback(
    (fieldName: string, value: string): string | null => {
      const rules = fields[fieldName];
      if (!rules) return null;

      // Required validation
      if (rules.required && (!value || value.trim() === '')) {
        return 'This field is required';
      }

      // Skip other validations if field is empty and not required
      if (!value.trim() && !rules.required) {
        return null;
      }

      // Email validation
      if (rules.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Please enter a valid format';
      }

      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Must be no more than ${rules.maxLength} characters`;
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value);
      }

      return null;
    },
    [fields]
  );

  const updateField = useCallback(
    (fieldName: string, value: string) => {
      setValidations(prev => {
        const currentField = prev[fieldName];
        const error = validateField(fieldName, value);
        const state: ValidationState = error
          ? 'error'
          : value.trim()
          ? 'success'
          : 'idle';

        return {
          ...prev,
          [fieldName]: {
            value,
            error,
            state,
            touched: currentField?.touched || value.length > 0,
          },
        };
      });
    },
    [validateField]
  );

  const touchField = useCallback((fieldName: string) => {
    setValidations(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));
  }, []);

  const isFormValid = useCallback(() => {
    return Object.values(validations).every(
      field =>
        field.state === 'success' ||
        (field.state === 'idle' &&
          !fields[
            Object.keys(validations).find(key => validations[key] === field)!
          ]?.required)
    );
  }, [validations, fields]);

  const getFieldProps = useCallback(
    (fieldName: string) => {
      const field = validations[fieldName];
      return {
        value: field?.value || '',
        error: field?.touched ? field.error : null,
        validationState: field?.state || 'idle',
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          updateField(fieldName, e.target.value);
        },
        onBlur: () => touchField(fieldName),
      };
    },
    [validations, updateField, touchField]
  );

  const resetForm = useCallback(() => {
    setValidations(
      Object.keys(fields).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            value: '',
            error: null,
            state: 'idle' as ValidationState,
            touched: false,
          },
        }),
        {}
      )
    );
  }, [fields]);

  return {
    validations,
    updateField,
    touchField,
    isFormValid,
    getFieldProps,
    resetForm,
  };
};
