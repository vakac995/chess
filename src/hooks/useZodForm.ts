import type { Optional } from '@/types';
import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodType, ZodTypeDef } from 'zod';

/**
 * Interface for the useZodForm hook options
 */
export interface UseZodFormProps<TSchema extends ZodType<FieldValues, ZodTypeDef, FieldValues>> {
  readonly schema: TSchema;
  readonly defaultValues?: Optional<Partial<z.infer<TSchema>>>;
  readonly values?: Optional<Partial<z.infer<TSchema>>>;
  readonly validationMode?: Optional<'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all'>;
}

/**
 * Interface for the useZodForm hook return type
 * Extends UseFormReturn with additional Zod-specific type safety
 */
export type UseZodFormReturn<TSchema extends ZodType<FieldValues, ZodTypeDef, FieldValues>> =
  UseFormReturn<z.infer<TSchema>>;

/**
 * Creates a form with Zod schema validation and enhanced error handling
 * @param options Options for the hook including schema and default values
 * @returns React Hook Form's form control methods and state with Zod type safety
 */
export function useZodForm<TSchema extends ZodType<FieldValues, ZodTypeDef, FieldValues>>({
  schema,
  defaultValues,
  values,
  validationMode = 'onBlur',
  ...formConfig
}: UseZodFormProps<TSchema> &
  Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>): UseZodFormReturn<TSchema> {
  const formMethods = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    values,
    mode: validationMode,
    ...formConfig,
  });
  return formMethods;
}
