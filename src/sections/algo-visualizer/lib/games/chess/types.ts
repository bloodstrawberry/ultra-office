export type ChessColor = 'w' | 'b';

export type ChessPieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  id: string;
  type: ChessPieceType;
  color: ChessColor;
}

export interface ChessSquare {
  r: number; // 0 (rank 8) to 7 (rank 1)
  c: number; // 0 (file a) to 7 (file h)
}

export type ChessBoard = (ChessPiece | null)[][];

export interface ChessMove {
  from: ChessSquare;
  to: ChessSquare;
  piece: ChessPiece;
  captured?: ChessPiece | null;
  promotion?: ChessPieceType;
  isCastling?: 'K' | 'Q';
  isEnPassant?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  san?: string;
}

export interface ChessSolutionNode {
  from: ChessSquare;
  to: ChessSquare;
  san: string;
  comment?: string;
  isCorrect?: boolean;
  aiResponse?: {
    from: ChessSquare;
    to: ChessSquare;
    san: string;
    comment?: string;
  };
  children?: ChessSolutionNode[];
}

export interface ChessPuzzle {
  id: string;
  title: string;
  difficulty: '초급' | '중급' | '고급';
  category: string;
  fen: string;
  playerColor: ChessColor;
  objective: string;
  hint: string;
  solutionTree: ChessSolutionNode[];
  explanation: string;
  csConcept: string;
}

export interface ChessAIAnalysis {
  evaluationScore: number; // Centipawns (+1.5 = +150 centipawns for white)
  mateIn?: number;
  isWhiteInCheck: boolean;
  isBlackInCheck: boolean;
  recommendedMoves: { move: ChessMove; score: number; reason: string }[];
  searchNodesEvaluated: number;
  searchDepth: number;
  timeMs: number;
}
