import type { ReactChildren, ReactClassNameProps } from '@/types';
import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

// Form component props interface
export interface FormProps<TFieldValues extends FieldValues>
  extends ReactChildren,
    ReactClassNameProps {
  readonly form: UseFormReturn<TFieldValues>;
  readonly onSubmit: SubmitHandler<TFieldValues>;
}
