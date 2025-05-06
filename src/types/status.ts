import { FieldErrorInfo } from './errors';

/**
 * Standard status types for async operations
 */
export type StatusType = 'idle' | 'pending' | 'fulfilled' | 'rejected';

/**
 * Loading state enum for consistent naming
 */
export enum LoadingStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

/**
 * Base state interface for any async data
 */
export interface AsyncState<T> {
  data: T | null;
  status: StatusType;
  error: FieldErrorInfo | null;
}

/**
 * Creates an initial state object for async data
 */
export function createInitialAsyncState<T>(): AsyncState<T> {
  return {
    data: null,
    status: LoadingStatus.IDLE,
    error: null,
  };
}
