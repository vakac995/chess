import { useAtom } from 'jotai';
import {
  userAtom,
  isAuthenticatedAtom,
  authStatusAtom,
  authErrorAtom,
  loginAtom,
  logoutAtom,
} from '@/store/authStore';
import { LoadingStatus } from '@/types/status';

/**
 * Hook that provides authentication state and actions
 */
export function useAuth() {
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
