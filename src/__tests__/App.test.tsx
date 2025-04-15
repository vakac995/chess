import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock ChessBoard component
vi.mock('../components/ChessBoard', () => {
  return {
    default: vi.fn().mockImplementation(() => (
      <div data-testid="mock-chess-board">Mock Chess Board</div>
    ))
  };
});

describe('App Component', () => {
  it('renders the header with the correct title', () => {
    render(<App />);
    const headerElement = screen.getByText('Chess Web Application');
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the ChessBoard component', () => {
    render(<App />);
    const chessBoardElement = screen.getByTestId('mock-chess-board');
    expect(chessBoardElement).toBeInTheDocument();
  });
});