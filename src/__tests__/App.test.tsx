import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../components/ChessBoard', () => {
  return {
    ChessBoard: vi
      .fn()
      .mockImplementation(() => <div data-testid="mock-chess-board">Mock Chess Board</div>),
  };
});

describe('App Component', () => {
  beforeEach(() => {
    (useAuth as Mock).mockReturnValue({ isAuthenticated: false });
  });

  it('renders the header with the correct title', () => {
    render(<App />);
    const headerElement = screen.getByText('Chess Web Application');
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the ChessBoard component when authenticated', () => {
    (useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    render(<App />);
    const chessBoardElement = screen.getByTestId('mock-chess-board');
    expect(chessBoardElement).toBeInTheDocument();
  });

  it('renders the LoginForm component when not authenticated', () => {
    render(<App />);
    const loginFormElement = screen.getByRole('heading', { name: /login/i });
    expect(loginFormElement).toBeInTheDocument();
    const chessBoardElement = screen.queryByTestId('mock-chess-board');
    expect(chessBoardElement).not.toBeInTheDocument();
  });
});
