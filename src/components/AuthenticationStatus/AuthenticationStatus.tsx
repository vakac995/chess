import { useAuth } from '../../hooks/useAuth';
import { ErrorInfo } from '../../components/Form';

export function AuthenticationStatus() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'password123' });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-4 my-4 bg-gray-100 border rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Authentication Status (Debug)</h2>
      <p className="mb-2">
        Status:{' '}
        <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
          {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </span>
      </p>

      {isLoading && <p className="text-blue-500 animate-pulse">Loading...</p>}

      {error && (
        <div className="my-2 p-2 bg-red-100 border border-red-300 rounded">
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

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleLogin}
          disabled={isLoading || isAuthenticated}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          Log In (Test)
        </button>
        <button
          onClick={handleLogout}
          disabled={!isAuthenticated || isLoading}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
