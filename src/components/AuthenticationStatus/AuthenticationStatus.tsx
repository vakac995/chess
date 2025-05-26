import { useAuth } from '@/hooks';
import { ErrorInfo } from '@/components/Form';
import type { AuthenticationStatusProps } from './AuthenticationStatus.types';

export const AuthenticationStatus = ({ compact = false }: AuthenticationStatusProps) => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'password123' });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`my-4 rounded border bg-gray-100 shadow ${compact ? 'p-2' : 'p-4'}`}>
      <h2 className={`font-semibold ${compact ? 'mb-1 text-lg' : 'mb-3 text-xl'}`}>
        Authentication Status {!compact && '(Debug)'}
      </h2>
      <p className={compact ? 'mb-1 text-sm' : 'mb-2'}>
        Status:{' '}
        <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
          {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </span>
      </p>

      {isLoading && <p className="animate-pulse text-blue-500">Loading...</p>}

      {error && (
        <div
          className={`rounded border border-red-300 bg-red-100 ${compact ? 'my-1 p-1' : 'my-2 p-2'}`}
        >
          <ErrorInfo error={error} />
        </div>
      )}

      {user && !compact && (
        <div className="mb-2 text-sm text-gray-700">
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          {user.username && <p>Username: {user.username}</p>}
        </div>
      )}

      {user && compact && (
        <div className="mb-1 text-xs text-gray-600">
          <p>{user.email}</p>
        </div>
      )}

      <div className={`flex gap-2 ${compact ? 'mt-2' : 'mt-4'}`}>
        <button
          onClick={handleLogin}
          disabled={isLoading || isAuthenticated}
          className={`rounded bg-blue-500 text-white transition duration-150 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${
            compact ? 'px-2 py-1 text-sm' : 'px-4 py-2'
          }`}
        >
          {compact ? 'Login' : 'Log In (Test)'}
        </button>
        <button
          onClick={handleLogout}
          disabled={!isAuthenticated || isLoading}
          className={`rounded bg-gray-500 text-white transition duration-150 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 ${
            compact ? 'px-2 py-1 text-sm' : 'px-4 py-2'
          }`}
        >
          {compact ? 'Logout' : 'Log Out'}
        </button>
      </div>
    </div>
  );
};
