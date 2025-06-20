import { atom, WritableAtom, PrimitiveAtom } from 'jotai';
import {
  LoadingStatus,
  type AsyncState,
  type StatusType,
  createInitialAsyncState,
  createError,
  createDetailedError,
} from '@/types';

// Types
export interface User {
  readonly id: string;
  readonly email: string;
  readonly username?: string;
}

interface AuthState extends AsyncState<User> {
  readonly isAuthenticated: boolean;
  readonly status: StatusType;
}

// Initial state
const initialState: AuthState = {
  ...createInitialAsyncState<User>(),
  isAuthenticated: false,
  status: LoadingStatus.IDLE,
};

// Primary auth atom
export const authAtom: PrimitiveAtom<AuthState> = atom<AuthState>(initialState);

// Derived read-only atoms
export const userAtom = atom((get): User | null => get(authAtom).data);
export const isAuthenticatedAtom = atom((get): boolean => get(authAtom).isAuthenticated);
export const authErrorAtom = atom(get => get(authAtom).error);
export const authStatusAtom = atom((get): StatusType => get(authAtom).status);

// Action atoms
export const loginAtom: WritableAtom<
  null,
  [{ email: string; password: string }],
  Promise<boolean>
> = atom(
  null,
  async (_, set, credentials: { email: string; password: string }): Promise<boolean> => {
    set(authAtom, prev => ({
      ...prev,
      status: LoadingStatus.PENDING,
      error: null,
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, 150));

      if (credentials.email === 'user@example.com' && credentials.password === 'password123') {
        set(authAtom, {
          data: { id: '1', email: credentials.email, username: 'User' },
          isAuthenticated: true,
          error: null,
          status: LoadingStatus.FULFILLED,
        });
        return true;
      } else {
        set(authAtom, prev => ({
          ...prev,
          isAuthenticated: false,
          data: null,
          error: createDetailedError(
            'Invalid credentials',
            'Please check your email and password',
            "Ensure you're using the correct email address and password combination.",
            'lock-error'
          ),
          status: LoadingStatus.REJECTED,
        }));
        return false;
      }
    } catch (error) {
      set(authAtom, prev => ({
        ...prev,
        isAuthenticated: false,
        data: null,
        error: createError(
          error instanceof Error ? error.message : 'An unexpected error occurred during login'
        ),
        status: LoadingStatus.REJECTED,
      }));
      return false;
    }
  }
);

export const logoutAtom: WritableAtom<null, [], boolean> = atom(null, (_, set): boolean => {
  set(authAtom, initialState);
  return true;
});
