import { useAtom } from 'jotai';
import {
  userAtom,
  isAuthenticatedAtom,
  authStatusAtom,
  authErrorAtom,
  loginAtom,
  logoutAtom,
  User,
} from '@/store';
import { LoadingStatus, type StatusType, type FieldErrorInfo } from '@/types';

/**
 * Interface for the useAuth hook return type
 */
export interface UseAuthReturn {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: FieldErrorInfo | null;
  readonly status: StatusType;
  readonly login: (credentials: { email: string; password: string }) => Promise<boolean>;
  readonly logout: () => boolean;
}

/**
 * Hook that provides authentication state and actions
 */
export function useAuth(): UseAuthReturn {
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [status] = useAtom(authStatusAtom);
  const [error] = useAtom(authErrorAtom);
  const [, login] = useAtom(loginAtom);
  const [, logout] = useAtom(logoutAtom);

  return {
    user,
    isAuthenticated,
    isLoading: status === LoadingStatus.PENDING,
    error,
    status,
    login,
    logout,
  };
}
