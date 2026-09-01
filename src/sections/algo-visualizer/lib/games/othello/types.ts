export type OthelloColor = 'B' | 'W';

export type OthelloGrid = (OthelloColor | null)[][];

export interface OthelloPoint {
  r: number;
  c: number;
}

export interface OthelloMoveResult {
  valid: boolean;
  flipped: OthelloPoint[];
  newBoard?: OthelloGrid;
  blackCount: number;
  whiteCount: number;
}

export interface OthelloSolutionNode {
  move: OthelloPoint;
  comment?: string;
  isCorrect?: boolean;
  aiResponse?: OthelloPoint;
  aiComment?: string;
  children?: OthelloSolutionNode[];
}

export interface OthelloProblem {
  id: string;
  title: string;
  difficulty: '초급';
  category: '모서리' | '착수선택' | '변장악' | '패리티' | '전멸';
  initialBlack: OthelloPoint[];
  initialWhite: OthelloPoint[];
  playerColor: OthelloColor;
  objective: string;
  hint: string;
  solutionTree: OthelloSolutionNode[];
  explanation: string;
  csConcept: string;
}

export interface OthelloAIAnalysis {
  evaluationScore: number;
  bestMove: OthelloPoint | null;
  recommendedMoves: { move: OthelloPoint; score: number; flippedCount: number }[];
  searchDepth: number;
  searchNodesEvaluated: number;
  timeMs: number;
  validMoves: OthelloPoint[];
}
