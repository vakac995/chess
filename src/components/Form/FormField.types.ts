import React from 'react';
import type { ReactClassNameProps, Optional, FieldErrorInfo } from '@/types';
import { FieldValues, Path, ControllerRenderProps } from 'react-hook-form';

export interface RenderPropInput<TFormValues extends FieldValues> {
  readonly field: ControllerRenderProps<TFormValues, Path<TFormValues>>;
  readonly error?: Optional<FieldErrorInfo>;
}

export interface FormFieldProps<TFormValues extends FieldValues> extends ReactClassNameProps {
  readonly name: Path<TFormValues>;
  readonly label?: Optional<string>;
  readonly render: (props: RenderPropInput<TFormValues>) => React.ReactElement;
}
