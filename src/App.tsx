import React, { useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import ChessBoard from './components/ChessBoard';
import { LoginForm } from './features/Authentication/LoginForm/LoginForm';
import { Header } from './components/Header/Header';
import { AuthenticationStatus } from './components/AuthenticationStatus/AuthenticationStatus';

const content = {
  authenticated: <ChessBoard width={480} />,
  unauthenticated: <LoginForm />,
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const Content = useMemo(() => {
    return content[isAuthenticated ? 'authenticated' : 'unauthenticated'];
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-start">
        <AuthenticationStatus />

        <div className="mt-8 w-full flex justify-center">{Content}</div>
      </main>

      <footer className="bg-gray-200 text-center p-4 text-sm text-gray-600">
        Chess App Footer
      </footer>
    </div>
  );
};

export default App;
