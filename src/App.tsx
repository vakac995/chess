import React, { useMemo, useState } from 'react';
import { useAuth } from './hooks';
import { ChessBoard } from './components/ChessBoard';
import { LoginForm, RegistrationForm } from './features/Authentication';
import { Header } from './components/Header';
import { AuthenticationStatus } from './components/AuthenticationStatus';
import { Footer } from './components/Footer';
import { ScrollableContent } from './components/ScrollableContent';
import { VisionSwitcher } from './components/VisionSwitcher';
import { DevDashboard } from './components/DevDashboard';

type AuthScreenType = 'login' | 'register';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('login');

  const handleSwitchToRegister = () => {
    setAuthScreen('register');
  };

  const handleSwitchToLogin = () => {
    setAuthScreen('login');
  };

  const Content = useMemo(() => {
    if (isAuthenticated) {
      return <ChessBoard width={480} />;
    }

    return authScreen === 'login' ? (
      <LoginForm onSwitchToRegister={handleSwitchToRegister} />
    ) : (
      <RegistrationForm onSwitchToLogin={handleSwitchToLogin} />
    );
  }, [isAuthenticated, authScreen]);

  const handleScroll = (scrollTop: number) => {
    const headerHeight = 64;
    setScrolledPastHeader(scrollTop > headerHeight);
  };

  return (
    <div className="app-container bg-background text-text flex h-screen flex-col overflow-hidden">
      <Header scrolledPastHeader={scrolledPastHeader} />

      <ScrollableContent onScroll={handleScroll}>
        <main className="p-container-padding flex flex-grow flex-col items-center justify-center">
          <VisionSwitcher />
          <AuthenticationStatus />
          <div className="mt-8 flex w-full justify-center">{Content}</div>
        </main>
        <Footer />
      </ScrollableContent>

      <DevDashboard />
    </div>
  );
};

export { App };
