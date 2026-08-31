export type JanggiSide = 'CHO' | 'HAN'; // 楚 (Green) vs 漢 (Red)

export type JanggiPieceType =
  | 'KING' // 楚/漢 (궁)
  | 'GUARD' // 士 (사)
  | 'CHARIOT' // 車 (차)
  | 'CANNON' // 包 (포)
  | 'HORSE' // 馬 (마)
  | 'ELEPHANT' // 象 (상)
  | 'SOLDIER'; // 卒/兵 (졸/병)

export interface JanggiPiece {
  id: string;
  type: JanggiPieceType;
  side: JanggiSide;
}

export interface JanggiPoint {
  r: number; // 0 to 9
  c: number; // 0 to 8
}

export type JanggiBoard = (JanggiPiece | null)[][];

export interface JanggiMove {
  from: JanggiPoint;
  to: JanggiPoint;
  piece: JanggiPiece;
  captured?: JanggiPiece | null;
  notation?: string;
  isCheck?: boolean;
}

export interface JanggiSolutionNode {
  from: JanggiPoint;
  to: JanggiPoint;
  notation: string;
  comment?: string;
  isCheck?: boolean;
  isCheckmate?: boolean;
  aiResponse?: {
    from: JanggiPoint;
    to: JanggiPoint;
    notation: string;
    comment?: string;
  };
  children?: JanggiSolutionNode[];
}

export interface JanggiBakboProblem {
  id: string;
  title: string;
  difficulty: '초급' | '중급' | '고급';
  category: '연장군 박보' | '외통박보' | '마포연합' | '양차공격' | '상길돌파';
  targetMoves: number;
  initialPieces: { r: number; c: number; piece: JanggiPiece }[];
  playerSide: JanggiSide; // usually 'CHO'
  objective: string;
  hint: string;
  solutionTree: JanggiSolutionNode[];
  explanation: string;
  csConcept: string;
}

export interface JanggiAIAnalysis {
  choScore: number;
  hanScore: number;
  scoreAdvantage: number;
  isChoInCheck: boolean;
  isHanInCheck: boolean;
  recommendedMoves: { move: JanggiMove; score: number; reason: string }[];
  searchNodesEvaluated: number;
  searchDepth: number;
  timeMs: number;
}
