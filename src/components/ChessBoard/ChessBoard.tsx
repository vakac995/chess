import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import styles from './ChessBoard.module.scss';
import type { ChessBoardProps, ChessMove } from './ChessBoard.types';

const ChessBoard = ({ width = 500 }: Readonly<ChessBoardProps>) => {
  const [game, setGame] = useState(new Chess());

  function makeAMove(move: ChessMove) {
    const gameCopy = new Chess(game.fen());

    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      return result;
    } catch {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    return move !== null;
  }

  function getGameStatus() {
    if (game.isCheckmate()) {
      return 'Checkmate!';
    }
    if (game.isDraw()) {
      return 'Draw!';
    }

    const currentPlayer = game.turn() === 'w' ? 'White' : 'Black';
    return `${currentPlayer}'s turn`;
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`${styles.chessboard} rounded-card overflow-hidden`}>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={width} />
      </div>

      <div className={`${styles.controlsWrapper} w-full`} style={{ maxWidth: width }}>
        <button
          className="rounded-button bg-primary hover:bg-primary/80 px-4 py-2 font-bold text-white"
          onClick={() => setGame(new Chess())}
        >
          Reset
        </button>

        <div className="text-text font-medium">{getGameStatus()}</div>
      </div>
    </div>
  );
};

export { ChessBoard };
