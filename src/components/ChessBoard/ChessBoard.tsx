import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import styles from './ChessBoard.module.scss';

interface ChessBoardProps {
  width?: number;
}

interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ width = 500 }) => {
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
      promotion: 'q', // Default promotion to queen
    });

    return move !== null;
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`${styles.chessboard} rounded-md overflow-hidden`}>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={width} />
      </div>

      <div className={`${styles.controlsWrapper} w-full`} style={{ maxWidth: width }}>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setGame(new Chess())}
        >
          Reset
        </button>

        <div className="text-gray-700 font-medium">
          {game.isCheckmate()
            ? 'Checkmate!'
            : game.isDraw()
              ? 'Draw!'
              : `${game.turn() === 'w' ? 'White' : 'Black'}'s turn`}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
