import { ReactNode } from 'react';
import { FieldValues, SubmitHandler, UseFormReturn, FormProvider } from 'react-hook-form';

interface FormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
  className?: string;
}

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
