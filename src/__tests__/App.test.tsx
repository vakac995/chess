import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'; // Add Mock import
import { render, screen } from '@testing-library/react';
import App from '../App';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock ChessBoard component
vi.mock('../components/ChessBoard', () => {
  return {
    default: vi
      .fn()
      .mockImplementation(() => <div data-testid="mock-chess-board">Mock Chess Board</div>),
  };
});

describe('App Component', () => {
  // Add beforeEach to set a default mock state
  beforeEach(() => {
    // Default to unauthenticated state unless overridden in a specific test
    (useAuth as Mock).mockReturnValue({ isAuthenticated: false }); // Use Mock type
  });

  it('renders the header with the correct title', () => {
    render(<App />);
    const headerElement = screen.getByText('Chess Web Application');
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the ChessBoard component when authenticated', () => {
    // Mock authenticated state for this specific test
    (useAuth as Mock).mockReturnValue({ isAuthenticated: true }); // Use Mock type

    render(<App />);
    const chessBoardElement = screen.getByTestId('mock-chess-board');
    expect(chessBoardElement).toBeInTheDocument();
  });

  it('renders the LoginForm component when not authenticated', () => {
    // No need to mock here, beforeEach handles the unauthenticated state
    render(<App />);
    // Assuming LoginForm has a specific element or role we can query
    // For example, if LoginForm has a heading 'Login'
    const loginFormElement = screen.getByRole('heading', { name: /login/i });
    expect(loginFormElement).toBeInTheDocument();
    // Ensure ChessBoard is NOT rendered
    const chessBoardElement = screen.queryByTestId('mock-chess-board');
    expect(chessBoardElement).not.toBeInTheDocument();
  });
});
