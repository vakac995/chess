import { FieldValues, FormProvider } from 'react-hook-form';
import type { FormProps } from './Form.types';

export const Form = <TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: Readonly<FormProps<TFieldValues>>) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
};
