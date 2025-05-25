import React from 'react';
import type { ReactClassNameProps } from '@/types';
import { FieldValues, Path, ControllerRenderProps } from 'react-hook-form';
import { FieldErrorInfo } from '@/types/errors';

// FormField render prop input interface
export interface RenderPropInput<TFormValues extends FieldValues> {
  readonly field: ControllerRenderProps<TFormValues, Path<TFormValues>>;
  readonly error?: FieldErrorInfo;
}

// FormField component props interface
export interface FormFieldProps<TFormValues extends FieldValues> extends ReactClassNameProps {
  readonly name: Path<TFormValues>;
  readonly label?: string;
  readonly render: (props: RenderPropInput<TFormValues>) => React.ReactElement;
}
