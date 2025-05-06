import React, { useMemo, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { ChessBoard } from './components/ChessBoard';
import { LoginForm } from './features/Authentication/LoginForm/LoginForm';
import { Header } from './components/Header/Header';
import { AuthenticationStatus } from './components/AuthenticationStatus/AuthenticationStatus';
import { Footer } from './components/Footer';
import { ScrollableContent } from './components/ScrollableContent';

const content = {
  authenticated: <ChessBoard width={480} />,
  unauthenticated: <LoginForm />,
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);

  const Content = useMemo(() => {
    return content[isAuthenticated ? 'authenticated' : 'unauthenticated'];
  }, [isAuthenticated]);

  const handleScroll = (scrollTop: number) => {
    const headerHeight = 64;
    setScrolledPastHeader(scrollTop > headerHeight);
  };

  return (
    <div className="app-container flex h-screen flex-col overflow-hidden">
      <Header scrolledPastHeader={scrolledPastHeader} />

      <ScrollableContent onScroll={handleScroll}>
        <main className="flex flex-grow flex-col items-center justify-center p-4">
          <AuthenticationStatus />
          <div className="mt-8 flex w-full justify-center">{Content}</div>
        </main>
        <Footer />
      </ScrollableContent>
    </div>
  );
};

export default App;
