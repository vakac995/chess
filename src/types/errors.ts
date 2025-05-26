import { Optional } from './index';

/**
 * Base error interface - foundation for all error types
 */
export interface BaseErrorInfo {
  /** The main error message */
  readonly message: string;
}

/**
 * Enhanced field error structure with additional context
 */
export interface FieldErrorInfo extends BaseErrorInfo {
  /** Optional short additional info */
  readonly info?: string;
  /** Optional longer description */
  readonly description?: string;
  /** Optional icon identifier (e.g., string name or path) */
  readonly icon?: string;
  /** Optional field path this error applies to */
  readonly path?: string | string[];
  /** Optional error code for programmatic handling */
  readonly code?: string;
  /** Optional severity level */
  readonly severity?: ErrorSeverity;
}

/**
 * API error structure for backend service errors
 */
export interface ApiErrorInfo extends BaseErrorInfo {
  /** HTTP status code */
  readonly status?: number;
  /** Error code from the API */
  readonly code?: string;
  /** Request ID or trace ID for debugging */
  readonly requestId?: string;
  /** Additional error details */
  readonly details?: Record<string, unknown>;
  /** Whether this error is retryable */
  readonly retryable?: boolean;
}

/**
 * Validation error structure specifically for form validation errors
 */
export interface ValidationErrorInfo extends FieldErrorInfo {
  /** The rule that failed validation */
  readonly rule?: string;
  /** List of failing validation rules */
  readonly rules?: string[];
  /** Expected valid value format or range */
  readonly expected?: string;
  /** Whether this validation can be automatically fixed */
  readonly fixable?: boolean;
}

/**
 * Network error structure for connectivity issues
 */
export interface NetworkErrorInfo extends BaseErrorInfo {
  /** Whether a retry might succeed */
  readonly retryable: boolean;
  /** How many retry attempts have been made */
  readonly attempts?: number;
  /** Suggested delay before retrying in milliseconds */
  readonly retryDelayMs?: number;
  /** Whether the issue is likely on the client side */
  readonly clientSide?: boolean;
}

/**
 * Generic error container type that can hold any error type
 */
export type ErrorContainer = FieldErrorInfo | ApiErrorInfo | ValidationErrorInfo | NetworkErrorInfo;

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Type guard to check if an object is a FieldErrorInfo
 */
export function isFieldErrorInfo(error: unknown): error is FieldErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    (!('info' in error) || typeof (error as FieldErrorInfo).info === 'string') &&
    (!('description' in error) || typeof (error as FieldErrorInfo).description === 'string') &&
    (!('icon' in error) || typeof (error as FieldErrorInfo).icon === 'string')
  );
}

/**
 * Type guard to check if an object is an ApiErrorInfo
 */
export function isApiErrorInfo(error: unknown): error is ApiErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    ('status' in error || 'code' in error || 'requestId' in error)
  );
}

/**
 * Type guard to check if an object is a ValidationErrorInfo
 */
export function isValidationErrorInfo(error: unknown): error is ValidationErrorInfo {
  return isFieldErrorInfo(error) && ('rule' in error || 'rules' in error || 'expected' in error);
}

/**
 * Type guard to check if an object is a NetworkErrorInfo
 */
export function isNetworkErrorInfo(error: unknown): error is NetworkErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    'retryable' in error &&
    typeof (error as NetworkErrorInfo).retryable === 'boolean'
  );
}

/**
 * Enhanced form error structure for all fields
 */
export type FormFieldErrors<T> = {
  readonly [K in keyof T]?: FieldErrorInfo;
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

/**
 * Creates an API error
 */
export function createApiError(
  message: string,
  options?: Optional<{
    status?: number;
    code?: string;
    requestId?: string;
    details?: Record<string, unknown>;
    retryable?: boolean;
  }>
): ApiErrorInfo {
  return {
    message,
    status: options?.status,
    code: options?.code,
    requestId: options?.requestId,
    details: options?.details,
    retryable: options?.retryable ?? false,
  };
}

/**
 * Creates a validation error
 */
export function createValidationError(
  message: string,
  options?: Optional<{
    rule?: string;
    rules?: string[];
    expected?: string;
    fixable?: boolean;
    info?: string;
    description?: string;
    icon?: string;
  }>
): ValidationErrorInfo {
  return {
    message,
    rule: options?.rule,
    rules: options?.rules,
    expected: options?.expected,
    fixable: options?.fixable ?? false,
    info: options?.info,
    description: options?.description,
    icon: options?.icon,
  };
}

/**
 * Creates a network error
 */
export function createNetworkError(
  message: string,
  options?: Optional<{
    retryable: boolean;
    attempts?: number;
    retryDelayMs?: number;
    clientSide?: boolean;
  }>
): NetworkErrorInfo {
  return {
    message,
    retryable: options?.retryable ?? false,
    attempts: options?.attempts,
    retryDelayMs: options?.retryDelayMs,
    clientSide: options?.clientSide ?? false,
  };
}
