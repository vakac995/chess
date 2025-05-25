import { useFormContext, Controller, FieldValues } from 'react-hook-form';
import { extractReactHookFormError } from '@/utils/error';
import type { FormFieldProps } from './FormField.types';

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
        <label htmlFor={name} className="text-text mb-1 block text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <Controller
          control={control}
          name={name}
          render={({ field, fieldState }) => {
            // Convert react-hook-form error to our standardized FieldErrorInfo type
            const enhancedError = fieldState.error
              ? extractReactHookFormError(fieldState.error)
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
