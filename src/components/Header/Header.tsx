import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  readonly scrolledPastHeader?: boolean;
}

export const Header = ({ scrolledPastHeader }: HeaderProps) => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  const headerBaseClasses =
    'sticky top-0 z-50 bg-gray-900 text-white transition-all duration-300 ease-in-out';
  const headerNormalClasses = 'py-3 h-16';
  const headerScrolledClasses = 'py-1 h-12';

  return (
    <header
      className={`${headerBaseClasses} ${scrolledPastHeader ? headerScrolledClasses : headerNormalClasses}`}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <h1
          className={`font-bold ${scrolledPastHeader ? 'text-md' : 'text-lg'} transition-all duration-300 ease-in-out`}
        >
          Chess Web Application
        </h1>

        <div className="flex items-center space-x-4">
          {error && !isLoading && (
            <div className="text-sm text-red-300" title={error.description ?? error.info}>
              Login Error: {error.message}
            </div>
          )}

          {isAuthenticated ? (
            <>
              <span className={`text-sm ${scrolledPastHeader ? 'hidden md:inline' : ''}`}>
                Welcome, {user?.username ?? user?.email}
              </span>
              <button
                onClick={() => logout()}
                disabled={isLoading}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white transition duration-150 hover:bg-red-700 disabled:opacity-50"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => login({ email: 'user@example.com', password: 'password123' })}
              disabled={isLoading}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition duration-150 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login (Test)'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
