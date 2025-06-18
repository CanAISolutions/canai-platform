import * as React from 'react';
import { cn } from '@/lib/utils';
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';
import {
  StandardForm,
  StandardFormGroup,
  StandardFormLabel,
  StandardFormInput,
  StandardFormTextarea,
  StandardFormHelperText,
} from './standard-form';

interface ValidatedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  fields: Record<string, ValidationRule>;
  onValidSubmit?: (data: Record<string, string>) => void;
  variant?: 'default' | 'modal' | 'inline';
}

export const ValidatedForm = React.forwardRef<
  HTMLFormElement,
  ValidatedFormProps
>(
  (
    {
      className,
      fields,
      onValidSubmit,
      variant = 'default',
      children,
      onSubmit,
      ...props
    },
    ref
  ) => {
    const { validations, getFieldProps, isFormValid } =
      useFormValidation(fields);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isFormValid() && onValidSubmit) {
        const formData = Object.keys(validations).reduce(
          (acc, key) => ({
            ...acc,
            [key]: validations[key].value,
          }),
          {}
        );

        onValidSubmit(formData);
      }

      onSubmit?.(e);
    };

    return (
      <StandardForm
        ref={ref}
        className={cn('relative', className)}
        variant={variant}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </StandardForm>
    );
  }
);
ValidatedForm.displayName = 'ValidatedForm';

interface ValidatedFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  validation: any;
  className?: string;
}

export const ValidatedField = React.forwardRef<
  HTMLDivElement,
  ValidatedFieldProps
>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      helperText,
      required,
      validation,
      className,
    },
    ref
  ) => {
    const fieldProps = validation.getFieldProps(name);
    const fieldValidation = validation.validations[name];

    return (
      <StandardFormGroup
        ref={ref}
        className={className}
        required={required}
        error={fieldProps.error}
        success={fieldValidation?.state === 'success'}
        validationState={fieldProps.validationState}
      >
        <StandardFormLabel htmlFor={name} required={required}>
          {label}
        </StandardFormLabel>

        {type === 'textarea' ? (
          <StandardFormTextarea
            id={name}
            name={name}
            placeholder={placeholder}
            validationState={fieldProps.validationState}
            value={fieldProps.value}
            onChange={fieldProps.onChange}
            onBlur={fieldProps.onBlur}
            aria-describedby={
              helperText
                ? `${name}-helper`
                : fieldProps.error
                ? `${name}-error`
                : undefined
            }
            aria-invalid={!!fieldProps.error}
          />
        ) : (
          <StandardFormInput
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            validationState={fieldProps.validationState}
            value={fieldProps.value}
            onChange={fieldProps.onChange}
            onBlur={fieldProps.onBlur}
            aria-describedby={
              helperText
                ? `${name}-helper`
                : fieldProps.error
                ? `${name}-error`
                : undefined
            }
            aria-invalid={!!fieldProps.error}
          />
        )}

        {helperText && (
          <StandardFormHelperText id={`${name}-helper`}>
            {helperText}
          </StandardFormHelperText>
        )}
      </StandardFormGroup>
    );
  }
);
ValidatedField.displayName = 'ValidatedField';

export { useFormValidation };
