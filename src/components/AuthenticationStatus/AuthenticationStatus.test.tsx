import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthenticationStatus } from './AuthenticationStatus';

interface MockUser {
  id: string;
  email: string;
  username?: string;
}

interface MockUseAuthReturn {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: { message?: string } | null;
  login: () => void;
  logout: () => void;
}

const login = vi.fn();
const logout = vi.fn();

let mockUseAuthReturn: MockUseAuthReturn;

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuthReturn,
}));

vi.mock('../Form/ErrorInfo', () => ({
  ErrorInfo: ({ error }: { error?: { message?: string } }) => (
    <div data-testid="error-info">{error?.message}</div>
  ),
}));

describe('AuthenticationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthReturn = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login,
      logout,
    };
  });

  it('renders unauthenticated state', () => {
    render(<AuthenticationStatus />);
    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    expect(screen.getByText('Log In (Test)')).toBeEnabled();
    expect(screen.getByText('Log Out')).toBeDisabled();
  });

  it('renders authenticated state and user info', () => {
    mockUseAuthReturn = {
      user: { id: '1', email: 'user@example.com', username: 'testuser' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login,
      logout,
    };
    render(<AuthenticationStatus />);
    expect(screen.getByText('Authenticated')).toBeInTheDocument();
    expect(screen.getByText('User ID: 1')).toBeInTheDocument();
    expect(screen.getByText('Email: user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Username: testuser')).toBeInTheDocument();
    expect(screen.getByText('Log In (Test)')).toBeDisabled();
    expect(screen.getByText('Log Out')).toBeEnabled();
  });

  it('shows loading state', () => {
    mockUseAuthReturn = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login,
      logout,
    };
    render(<AuthenticationStatus />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Log In (Test)')).toBeDisabled();
  });

  it('shows error info', () => {
    mockUseAuthReturn = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: { message: 'Test error' },
      login,
      logout,
    };
    render(<AuthenticationStatus />);
    expect(screen.getByTestId('error-info')).toHaveTextContent('Test error');
  });

  it('calls login and logout handlers', async () => {
    render(<AuthenticationStatus />);
    const loginBtn = screen.getByText('Log In (Test)');
    fireEvent.click(loginBtn);
    expect(login).toHaveBeenCalled();

    mockUseAuthReturn = {
      user: { id: '1', email: 'user@example.com' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login,
      logout,
    };
    render(<AuthenticationStatus />);
    const logoutBtns = screen.getAllByText('Log Out');
    const enabledLogoutBtn = logoutBtns.find(btn => !btn.hasAttribute('disabled'));
    expect(enabledLogoutBtn).toBeDefined();
    if (enabledLogoutBtn) fireEvent.click(enabledLogoutBtn);
    expect(logout).toHaveBeenCalled();
  });
});
