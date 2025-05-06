/**
 * Enhanced field error structure with additional context
 */
export interface FieldErrorInfo {
  /** The main error message */
  message: string;
  /** Optional short additional info */
  info?: string;
  /** Optional longer description */
  description?: string;
  /** Optional icon identifier (e.g., string name or path) */
  icon?: string;
}

/**
 * Type guard to check if an object is a FieldErrorInfo
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFieldErrorInfo(error: any): error is FieldErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof error.message === 'string' &&
    ('info' in error ? typeof error.info === 'string' : true) &&
    ('description' in error ? typeof error.description === 'string' : true) &&
    ('icon' in error ? typeof error.icon === 'string' : true)
  );
}

/**
 * Enhanced form error structure for all fields
 */
export type FormFieldErrors<T> = {
  [K in keyof T]?: FieldErrorInfo;
};

/**
 * Creates a basic error with just a message
 */
export function createError(message: string): FieldErrorInfo {
  return { message };
}

/**
 * Creates a detailed error with additional information
 */
export function createDetailedError(
  message: string,
  info?: string,
  description?: string,
  icon?: string
): FieldErrorInfo {
  return { message, info, description, icon };
}
