import React from 'react';

/**
 * Type Utilities for consistent usage
 * These utilities provide standardized type patterns for common scenarios
 * to ensure consistent typing across the codebase.
 */

// Basic type utilities
export type Maybe<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Function type utilities
export type GenericFunction = (...args: unknown[]) => unknown;
export type VoidFunction = (...args: unknown[]) => void;
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;
export type NoArgFunction<R = void> = () => R;

// React-specific type utilities
export type ReactChildren = {
  readonly children?: React.ReactNode;
};

export type ReactClassNameProps = {
  readonly className?: Optional<string>;
};

export type ReactStylableProps = ReactClassNameProps & {
  readonly style?: Optional<React.CSSProperties>;
};

// Common component type utilities
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };
export type WithReadonly<T> = { readonly [P in keyof T]: T[P] };

// Record utilities
export type RecordOf<T> = Record<string, T>;
export type StringRecord = RecordOf<string>;
export type NumberRecord = RecordOf<number>;
export type BooleanRecord = RecordOf<boolean>;

// ID utilities
export type ID = string | number;
export type EntityWithId = { readonly id: ID };

// Status handling utilities
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
export type RequestStatus<T = unknown, E = Error> = {
  readonly status: AsyncStatus;
  readonly data?: T;
  readonly error?: E;
  readonly isLoading: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
};

// Nested object utilities
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends (...args: unknown[]) => unknown
    ? T
    : T extends object
      ? DeepReadonlyObject<T>
      : T;

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

// Form and validation utilities
export type FormFieldProps<T = unknown> = {
  readonly name: string;
  readonly label?: string;
  readonly value?: T;
  readonly onChange?: (value: T) => void;
  readonly error?: Maybe<string>;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly placeholder?: string;
};

// Additional form utilities
export type FormFieldValidator<T> = (value: T) => string | undefined;

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type FormFieldConfig<T> = {
  readonly name: keyof T & string;
  readonly label: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly validate?: FormFieldValidator<T[keyof T]>;
};

export type FormConfig<T> = {
  readonly fields: ReadonlyArray<FormFieldConfig<T>>;
  readonly onSubmit: (data: T) => void | Promise<void>;
  readonly onError?: (errors: FormErrors<T>) => void;
};

// Event handler type utilities
export type ChangeEventHandler<T = Element> = React.ChangeEventHandler<T>;
export type MouseEventHandler<T = Element> = React.MouseEventHandler<T>;
export type KeyboardEventHandler<T = Element> = React.KeyboardEventHandler<T>;

// Type guard utilities
export type TypeGuard<T> = (value: unknown) => value is T;
export type AsyncTypeGuard<T> = (value: unknown) => Promise<boolean> & { _type?: T };

// Utility for discriminated unions
export type Discriminate<T, K extends keyof T, V extends T[K]> = T extends { [P in K]: V }
  ? T
  : never;

// Component utilities
export type ComponentWithChildren<P = object> = React.FC<P & ReactChildren>;

export type PropsWithTestId<P = object> = P & {
  readonly testId?: string;
};

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ComponentStatus = 'default' | 'hover' | 'active' | 'disabled';

export type SizableComponent<P = object> = P & {
  readonly size?: ComponentSize;
};

export type VariantComponent<P = object> = P & {
  readonly variant?: ComponentVariant;
};

export type StatusableComponent<P = object> = P & {
  readonly status?: ComponentStatus;
};

export type BaseComponentProps = ReactStylableProps &
  PropsWithTestId &
  SizableComponent &
  VariantComponent;

// Environment utilities
export type Environment = 'development' | 'production' | 'test';

export type EnvConfig<T = unknown> = {
  readonly development: T;
  readonly production: T;
  readonly test?: T;
};

export type EnvValue<T> = {
  readonly value: T;
  readonly env: Environment;
};

export type DevelopmentOnly<T> = {
  readonly developmentValue: T;
};

export type ProductionOnly<T> = {
  readonly productionValue: T;
};

// Re-export error types for convenience
export * from './errors';
export * from './status';
