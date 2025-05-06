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
      <div className="container mx-auto px-4 flex justify-between items-center h-full">
        <h1
          className={`font-bold ${scrolledPastHeader ? 'text-md' : 'text-lg'} transition-all duration-300 ease-in-out`}
        >
          Chess Web Application
        </h1>

        <div className="flex items-center space-x-4">
          {error && !isLoading && (
            <div className="text-red-300 text-sm" title={error.description ?? error.info}>
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
};
