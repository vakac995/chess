import type { Optional } from '@/types';

export interface ChessBoardProps {
  readonly width?: Optional<number>;
}

export interface ChessMove {
  readonly from: string;
  readonly to: string;
  readonly promotion?: Optional<string>;
}
