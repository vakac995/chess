import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';
import { Button } from '../Button';
import type { HeaderProps } from './Header.types';

export const Header = ({ scrolledPastHeader }: HeaderProps) => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  const headerClasses = clsx(
    'sticky top-0 z-50 bg-secondary text-white transition-all duration-300 ease-in-out',
    {
      'py-3 h-16': !scrolledPastHeader,
      'py-1 h-12': scrolledPastHeader,
    }
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <h1
          className={clsx(
            'font-bold transition-all duration-300 ease-in-out',
            scrolledPastHeader ? 'text-md' : 'text-lg'
          )}
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
              <span className={clsx('text-sm', scrolledPastHeader ? 'hidden md:inline' : '')}>
                Welcome, {user?.username ?? user?.email}
              </span>
              <Button intent="danger" size="sm" onClick={() => logout()} disabled={isLoading}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              intent="primary"
              size="sm"
              onClick={() => login({ email: 'user@example.com', password: 'password123' })}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login (Test)'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
