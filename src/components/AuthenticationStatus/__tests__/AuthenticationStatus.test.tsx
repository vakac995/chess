import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest'; // Import Mock type
import { AuthenticationStatus } from '../AuthenticationStatus';
import { useAuth } from '@/hooks';
import { ErrorInfo } from '@/components/Form';

// Mock the useAuth hook
vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

// Mock the ErrorInfo component
vi.mock('@/components/Form', () => ({
  ErrorInfo: vi.fn(({ error }) => <div data-testid="error-info">{error?.message ?? 'Error'}</div>), // Changed || to ??
}));

describe('AuthenticationStatus', () => {
  let mockLogin: Mock;
  let mockLogout: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn().mockResolvedValue(undefined);
    mockLogout = vi.fn();
  });

  const setup = (props: Partial<ReturnType<typeof useAuth>> & { compact?: boolean } = {}) => {
    const defaultAuthValues = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      logout: mockLogout,
    };
    (useAuth as Mock).mockReturnValue({ ...defaultAuthValues, ...props });
    return render(<AuthenticationStatus compact={props.compact} />);
  };

  it('renders not authenticated state by default', () => {
    setup();
    expect(screen.getByText(/Status:/i)).toHaveTextContent('Not Authenticated');
    expect(screen.getByRole('button', { name: /Log In \(Test\)/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Log Out/i })).toBeDisabled();
  });

  it('renders authenticated state', () => {
    setup({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' } });
    expect(screen.getByText(/Status:/i)).toHaveTextContent('Authenticated');
    expect(screen.getByText(/User ID: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Email: test@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In \(Test\)/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Log Out/i })).toBeEnabled();
  });

  it('calls login on login button click', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Log In \(Test\)/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' });
  });

  it('calls logout on logout button click', () => {
    setup({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Log Out/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    setup({ isLoading: true });
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In \(Test\)/i })).toBeDisabled();
  });

  it('shows error message', () => {
    const testError = { message: 'Login failed' };
    setup({ error: testError });
    expect(screen.getByTestId('error-info')).toHaveTextContent('Login failed');
    // Match the actual call signature where a second undefined argument might be passed by React/Testing Library
    expect(ErrorInfo).toHaveBeenCalledWith(
      expect.objectContaining({ error: testError }),
      undefined
    );
  });

  describe('Compact mode', () => {
    it('renders compact not authenticated state', () => {
      setup({ compact: true });
      expect(screen.getByText(/Status:/i)).toHaveTextContent('Not Authenticated');
      expect(screen.getByRole('button', { name: /Login/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /Logout/i })).toBeDisabled();
      expect(screen.queryByText(/\(Debug\)/i)).not.toBeInTheDocument();
    });

    it('renders compact authenticated state with user email', () => {
      setup({
        isAuthenticated: true,
        user: { id: '1', email: 'compact@example.com' },
        compact: true,
      });
      expect(screen.getByText(/Status:/i)).toHaveTextContent('Authenticated');
      expect(screen.getByText(/compact@example.com/i)).toBeInTheDocument();
      expect(screen.queryByText(/User ID:/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Login/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Logout/i })).toBeEnabled();
    });

    it('calls login on compact login button click', async () => {
      setup({ compact: true });
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
      await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    it('calls logout on compact logout button click', () => {
      setup({
        isAuthenticated: true,
        user: { id: '1', email: 'compact@example.com' },
        compact: true,
      });
      fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('displays username if available in non-compact mode', () => {
    setup({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', username: 'TestUser' },
    });
    expect(screen.getByText(/Username: TestUser/i)).toBeInTheDocument();
  });

  it('does not display username if not available in non-compact mode', () => {
    setup({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' } });
    expect(screen.queryByText(/Username:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toHaveTextContent('Authenticated');
    expect(screen.getByText(/User ID: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Email: test@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In \(Test\)/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Log Out/i })).toBeEnabled();
  });

  it('does not display username in compact mode even if available', () => {
    setup({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', username: 'TestUser' },
      compact: true,
    });
    expect(screen.queryByText(/Username:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toHaveTextContent('Authenticated');
    expect(screen.getByRole('button', { name: /Logout/i })).toBeEnabled();
  });

  it('matches snapshot in default state', () => {
    const { asFragment } = setup();
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot in authenticated state', () => {
    const { asFragment } = setup({
      isAuthenticated: true,
      user: { id: '1', email: 'snap@example.com', username: 'SnapUser' },
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot in compact authenticated state', () => {
    const { asFragment } = setup({
      isAuthenticated: true,
      user: { id: '1', email: 'snap.compact@example.com' },
      compact: true,
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot in loading state', () => {
    const { asFragment } = setup({ isLoading: true });
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot in error state', () => {
    const { asFragment } = setup({ error: { message: 'Snapshot error' } });
    expect(asFragment()).toMatchSnapshot();
  });
});
