export interface ChessBoardProps {
  readonly width?: number;
}

export interface ChessMove {
  readonly from: string;
  readonly to: string;
  readonly promotion?: string;
}
