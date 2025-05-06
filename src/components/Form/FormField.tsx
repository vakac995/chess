import React from 'react';
import {
  useFormContext,
  Controller,
  FieldValues,
  Path,
  ControllerRenderProps,
  FieldError,
} from 'react-hook-form';
import { FieldErrorInfo } from '../../types/errors';

interface RenderPropInput<TFormValues extends FieldValues> {
  readonly field: ControllerRenderProps<TFormValues, Path<TFormValues>>;
  readonly error?: FieldErrorInfo;
}

interface FormFieldProps<TFormValues extends FieldValues> {
  readonly name: Path<TFormValues>;
  readonly label?: string;
  readonly className?: string;
  readonly render: (props: RenderPropInput<TFormValues>) => React.ReactElement;
}

export const FormField = <TFormValues extends FieldValues>({
  name,
  label,
  className,
  render,
}: FormFieldProps<TFormValues>) => {
  const { control } = useFormContext<TFormValues>();

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <Controller
          control={control}
          name={name}
          render={({ field, fieldState }) => {
            const enhancedError = fieldState.error
              ? extractZodErrorInfo(fieldState.error)
              : undefined;

            return render({
              field,
              error: enhancedError,
            });
          }}
        />
      </div>
    </div>
  );
};

function extractZodErrorInfo(error: FieldError): FieldErrorInfo {
  if (!error) return { message: '' };

  const message = error.message ?? 'Invalid input';

  const enhancedError: FieldErrorInfo = { message };

  return enhancedError;
}
