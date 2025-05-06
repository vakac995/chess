import { useAuth } from '../../hooks/useAuth';
import { ErrorInfo } from '../../components/Form';

export const AuthenticationStatus = () => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'password123' });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="my-4 rounded border bg-gray-100 p-4 shadow">
      <h2 className="mb-3 text-xl font-semibold">Authentication Status (Debug)</h2>
      <p className="mb-2">
        Status:{' '}
        <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
          {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </span>
      </p>

      {isLoading && <p className="animate-pulse text-blue-500">Loading...</p>}

      {error && (
        <div className="my-2 rounded border border-red-300 bg-red-100 p-2">
          <ErrorInfo error={error} />
        </div>
      )}

      {user && (
        <div className="mb-2 text-sm text-gray-700">
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          {user.username && <p>Username: {user.username}</p>}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleLogin}
          disabled={isLoading || isAuthenticated}
          className="rounded bg-blue-500 px-4 py-2 text-white transition duration-150 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Log In (Test)
        </button>
        <button
          onClick={handleLogout}
          disabled={!isAuthenticated || isLoading}
          className="rounded bg-gray-500 px-4 py-2 text-white transition duration-150 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};
