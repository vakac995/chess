import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  return (
    <header>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">Chess Web Application</h1>

        <div className="flex items-center space-x-4">
          {error && !isLoading && (
            <div className="text-red-300 text-sm" title={error.description ?? error.info}>
              Login Error: {error.message}
            </div>
          )}

          {isAuthenticated ? (
            <>
              <span className="text-sm">Welcome, {user?.username ?? user?.email}</span>
              <button
                onClick={() => logout()}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition duration-150"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => login({ email: 'user@example.com', password: 'password123' })}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition duration-150"
            >
              {isLoading ? 'Logging in...' : 'Login (Test)'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
