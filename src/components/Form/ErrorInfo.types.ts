import type { FieldError } from 'react-hook-form';
import type { ReactClassNameProps, Optional, FieldErrorInfo } from '@/types';

/**
 * Props for the ErrorInfo component
 */
export interface ErrorInfoProps extends ReactClassNameProps {
  /**
   * The error to display. Can be a React Hook Form FieldError,
   * our custom FieldErrorInfo, or any other error type
   */
  readonly error?: Optional<FieldError | FieldErrorInfo | Error>;
}
