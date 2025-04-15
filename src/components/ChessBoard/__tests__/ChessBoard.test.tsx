import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChessBoard from '../ChessBoard';
import { Chess } from 'chess.js';

// Mock chess.js
const mockMove = vi.fn();
const mockChessInstance = {
  fen: vi.fn().mockReturnValue('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
  move: mockMove,
  isCheckmate: vi.fn().mockReturnValue(false),
  isDraw: vi.fn().mockReturnValue(false),
  turn: vi.fn().mockReturnValue('w'),
};

vi.mock('chess.js', () => {
  return {
    Chess: vi.fn().mockImplementation(() => mockChessInstance),
  };
});

// Mock react-chessboard
vi.mock('react-chessboard', () => {
  return {
    Chessboard: vi.fn().mockImplementation(({ position, onPieceDrop, boardWidth }) => (
      <div data-testid="chess-board" data-position={position} data-width={boardWidth}>
        <button data-testid="mock-piece" onClick={() => onPieceDrop('e2', 'e4')}>
          Move Piece
        </button>
      </div>
    )),
  };
});

describe('ChessBoard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMove.mockReturnValue({ from: 'e2', to: 'e4' }); // Ensure move returns a valid result
  });

  it('renders with default props', () => {
    render(<ChessBoard />);
    const chessboardElement = screen.getByTestId('chess-board');
    expect(chessboardElement).toBeInTheDocument();
  });

  it('displays the current player turn', () => {
    render(<ChessBoard />);
    expect(screen.getByText("White's turn")).toBeInTheDocument();
  });

  it('contains a reset button', () => {
    render(<ChessBoard />);
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
  });

  it('handles piece movement', () => {
    render(<ChessBoard />);
    const mockPiece = screen.getByTestId('mock-piece');
    fireEvent.click(mockPiece);
    // The Chess mock's move function should have been called
    expect(mockMove).toHaveBeenCalled();
  });

  it('resets the game when reset button is clicked', () => {
    render(<ChessBoard />);
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    // A new Chess instance should have been created
    expect(Chess).toHaveBeenCalled();
  });
});
