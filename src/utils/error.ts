import { z } from 'zod';
import type { FieldError } from 'react-hook-form';
import {
  FieldErrorInfo,
  ValidationErrorInfo,
  ApiErrorInfo,
  NetworkErrorInfo,
  isFieldErrorInfo,
  createDetailedError,
  createError,
  createApiError,
  createNetworkError,
} from '@/types';

/**
 * Extracts enhanced field error information from a Zod validation error
 * @param zodError The zod validation error
 * @returns Structured field error information
 */
export function extractZodErrorInfo(zodError: z.ZodIssue): FieldErrorInfo {
  const message = zodError.message;

  // Build error object with all potential properties
  let info: string | undefined;
  let description: string | undefined;
  let icon: string | undefined;

  // Extract additional information from custom error params if available
  if (zodError.code === z.ZodIssueCode.custom && zodError.params) {
    const params = zodError.params;

    if (params.info && typeof params.info === 'string') {
      info = params.info;
    }

    if (params.description && typeof params.description === 'string') {
      description = params.description;
    }

    if (params.icon && typeof params.icon === 'string') {
      icon = params.icon;
    }
  }

  return createDetailedError(message, info, description, icon);
}

/**
 * Extracts enhanced field error information from a React Hook Form field error
 * @param fieldError The field error from react-hook-form
 * @returns Structured field error information
 */
export function extractReactHookFormError(fieldError: FieldError): FieldErrorInfo {
  if (!fieldError) return createError('');

  const message = fieldError.message ?? 'Invalid input';
  let info: string | undefined;
  let description: string | undefined;
  let icon: string | undefined;

  // Check if error has Zod validation data
  if (
    fieldError.type === 'custom' &&
    fieldError.message &&
    typeof fieldError.message === 'string'
  ) {
    // Try to access potential Zod params that were passed through
    const params = (fieldError as unknown as { params?: Record<string, unknown> }).params;

    if (params) {
      if (typeof params.info === 'string') info = params.info;
      if (typeof params.description === 'string') description = params.description;
      if (typeof params.icon === 'string') icon = params.icon;
    }
  }

  return createDetailedError(message, info, description, icon);
}

/**
 * Normalizes any error type to a FieldErrorInfo
 * @param error Any error type
 * @returns Normalized FieldErrorInfo
 */
export function normalizeError(error: unknown): FieldErrorInfo {
  // Already a FieldErrorInfo
  if (isFieldErrorInfo(error)) {
    return error;
  }

  // Error instance
  if (error instanceof Error) {
    return createDetailedError(error.message, undefined, error.stack ?? undefined);
  }

  // String error
  if (typeof error === 'string') {
    return createError(error);
  }

  // Unknown error type
  return createError('An unknown error occurred');
}

/**
 * Creates a standardized API error from a fetch response
 * @param response The fetch Response object
 * @param defaultMessage Default message to use if none is provided
 * @returns Promise resolving to an ApiErrorInfo
 */
export async function createErrorFromResponse(
  response: Response,
  defaultMessage = 'API request failed'
): Promise<ApiErrorInfo> {
  let errorData: {
    message?: string;
    code?: string;
    requestId?: string;
    details?: Record<string, unknown>;
  } = {};

  try {
    // Try to parse response as JSON
    errorData = await response.json();
  } catch {
    // If parsing fails, use text content if available
    try {
      const textContent = await response.text();
      if (textContent) {
        errorData.message = textContent;
      }
    } catch {
      // If all fails, use default message
    }
  }

  return createApiError(
    errorData.message ?? defaultMessage,
    response.status,
    errorData.code,
    errorData.requestId,
    errorData.details,
    response.status >= 500 || response.status === 429
  );
}

/**
 * Maps validation errors to form fields
 * @param errors Array of validation errors
 * @param fieldMap Optional mapping of error paths to form field names
 * @returns Object with field names as keys and errors as values
 * @template TFields The type of form fields
 */
export function mapValidationErrorsToFields<TFields>(
  errors: Array<ValidationErrorInfo>,
  fieldMap?: Record<string, keyof TFields>
): Partial<Record<keyof TFields, ValidationErrorInfo>> {
  const result: Partial<Record<keyof TFields, ValidationErrorInfo>> = {};

  for (const error of errors) {
    if (error.path) {
      // Get the first path element (or the path itself if it's a string)
      const path = Array.isArray(error.path) ? error.path[0] : error.path;

      // Map the path to a field name if a field map is provided
      const fieldName = fieldMap?.[path] ?? (path as keyof TFields);

      if (fieldName) {
        result[fieldName] = error;
      }
    }
  }

  return result;
}

/**
 * Handles common error scenarios and returns a standardized error object
 * @param error Any caught error
 * @returns A standardized error object
 */
export function handleError(error: unknown): FieldErrorInfo | ApiErrorInfo | NetworkErrorInfo {
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return createNetworkError('Network connection error', true, 1, undefined, true);
  }

  // Response errors (from our createErrorFromResponse utility)
  if (isFieldErrorInfo(error)) {
    return error;
  }

  // Fallback for unhandled error types
  return normalizeError(error);
}

/**
 * Processes a Zod error and converts it to our standardized error format
 * @param zodError The Zod error to process
 * @returns Mapped field errors
 */
export function processZodError(zodError: z.ZodError): Record<string, FieldErrorInfo> {
  const result: Record<string, FieldErrorInfo> = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join('.');
    if (path) {
      result[path] = extractZodErrorInfo(issue);
    }
  }

  return result;
}
