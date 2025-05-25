import type { FieldError } from 'react-hook-form';
import type { FieldErrorInfo } from '@/types/errors';

/**
 * Props for the ErrorInfo component
 */
export interface ErrorInfoProps {
  /**
   * The error to display. Can be a React Hook Form FieldError,
   * our custom FieldErrorInfo, or any other error type
   */
  readonly error?: FieldError | FieldErrorInfo | Error;

  /** Optional CSS class name */
  readonly className?: string;
}
