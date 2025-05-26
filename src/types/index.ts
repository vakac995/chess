import React from 'react';
/**
 * @fileoverview Comprehensive type definitions for application development
 *
 * This module provides a complete set of TypeScript utility types for building
 * robust applications. These utilities ensure consistent typing patterns across
 * the codebase and reduce repetition of common type constructs.
 *
 * The types are organized into the following categories:
 *
 * - Basic type utilities: Wrappers for handling nullable/optional values
 * - Function type utilities: Common function signatures
 * - React-specific utilities: Types for React component development
 * - Component type utilities: Helpers for component props manipulation
 * - Record utilities: Typed Record helpers
 * - ID and entity utilities: Common patterns for entity identification
 * - Status handling: Types for async operation states
 * - Nested object utilities: Deep partial and readonly type transformations
 * - Form utilities: Types for form handling, validation, and configuration
 * - Event handler utilities: Typed React event handlers
 * - Type guard utilities: Types for runtime type checking
 * - Discriminated union utilities: Helpers for union type handling
 * - Component utilities: Common component prop patterns
 * - Environment utilities: Types for environment-specific configurations
 *
 * @example
 * // Using Maybe type for potentially undefined values
 * const getName = (user: Maybe<User>): string => {
 *   return user?.name ?? 'Unknown User';
 * };
 *
 * @example
 * // Creating a form configuration
 * const formConfig: FormConfig<UserData> = {
 *   fields: [
 *     {
 *       name: 'email',
 *       label: 'Email Address',
 *       required: true,
 *       validate: (value) => (!value.includes('@') ? 'Invalid email' : undefined)
 *     }
 *   ],
 *   onSubmit: (data) => saveUser(data)
 * };
 *
 * @example
 * // Using component utility types
 * type ButtonProps = BaseComponentProps & {
 *   onClick?: MouseEventHandler;
 *   isLoading?: boolean;
 * };
 *
 * @section Basic type utilities
 * Types for handling nullable and optional values.
 * @type {Maybe<T>} - Value that can be T, null, or undefined
 * @type {Nullable<T>} - Value that can be T or null
 * @type {Optional<T>} - Value that can be T or undefined
 *
 * @section Function type utilities
 * Common function signature types.
 * @type {GenericFunction} - Generic function with unknown arguments and return
 * @type {VoidFunction} - Function returning void
 * @type {AsyncFunction<T>} - Function returning Promise<T>
 * @type {NoArgFunction<R>} - Function with no arguments returning R
 *
 * @section React-specific type utilities
 * Types specific to React component development.
 * @type {ReactChildren} - Props with optional children
 * @type {ReactClassNameProps} - Props with optional className
 * @type {ReactStylableProps} - Props with optional className and style
 *
 * @section Common component type utilities
 * Utility types for component props manipulation.
 * @type {WithRequired<T, K>} - Makes specified properties required
 * @type {WithOptional<T, K>} - Makes specified properties optional
 * @type {WithReadonly<T>} - Makes all properties readonly
 *
 * @section Record utilities
 * Types for strongly-typed Record objects.
 * @type {RecordOf<T>} - Record with string keys and values of type T
 * @type {StringRecord} - Record with string values
 * @type {NumberRecord} - Record with number values
 * @type {BooleanRecord} - Record with boolean values
 *
 * @section ID and entity utilities
 * Common patterns for entity identification.
 * @type {ID} - String or number identifier
 * @type {EntityWithId} - Object with an id property
 *
 * @section Status handling utilities
 * Types for managing asynchronous operation states.
 * @type {AsyncStatus} - Status of an async operation
 * @type {RequestStatus<T, E>} - Complete request state including data and error
 *
 * @section Nested object utilities
 * Types for deep partial and readonly transformations.
 * @type {DeepPartial<T>} - Makes all properties and nested properties optional
 * @type {DeepReadonly<T>} - Makes all properties and nested properties readonly
 * @type {DeepReadonlyObject<T>} - Helper type for DeepReadonly
 *
 * @section Form and validation utilities
 * Types for form field props and validation.
 * @type {FormFieldProps<T>} - Common props for form field components
 * @type {FormFieldValidator<T>} - Function to validate a form field value
 * @type {FormErrors<T>} - Record of form field errors
 * @type {FormFieldConfig<T>} - Configuration for a form field
 * @type {FormConfig<T>} - Configuration for an entire form
 *
 * @section Event handler type utilities
 * React event handler type aliases.
 * @type {ChangeEventHandler<T>} - Handler for change events
 * @type {MouseEventHandler<T>} - Handler for mouse events
 * @type {KeyboardEventHandler<T>} - Handler for keyboard events
 *
 * @section Type guard utilities
 * Types for runtime type checking.
 * @type {TypeGuard<T>} - Function that checks if a value is of type T
 * @type {AsyncTypeGuard<T>} - Async function that checks if a value is of type T
 *
 * @section Discriminated union utilities
 * Helpers for working with discriminated unions.
 * @type {Discriminate<T, K, V>} - Extracts union members with specified key/value
 *
 * @section Component utilities
 * Common component prop patterns.
 * @type {ComponentWithChildren<P>} - Component that accepts children
 * @type {PropsWithTestId<P>} - Props with optional testId for testing
 * @type {ComponentSize} - Standard component size options
 * @type {ComponentVariant} - Standard component variant options
 * @type {ComponentStatus} - Standard component status options
 * @type {SizableComponent<P>} - Component with size prop
 * @type {VariantComponent<P>} - Component with variant prop
 * @type {StatusableComponent<P>} - Component with status prop
 * @type {BaseComponentProps} - Common base props for components
 *
 * @section Environment utilities
 * Types for environment-specific configurations.
 * @type {Environment} - Available environment types
 * @type {EnvConfig<T>} - Configuration per environment
 * @type {EnvValue<T>} - Value with associated environment
 * @type {DevelopmentOnly<T>} - Value only used in development
 * @type {ProductionOnly<T>} - Value only used in production
 *
 * @see {@link './errors'} For error-specific type definitions
 * @see {@link './status'} For status-specific type definitions
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
