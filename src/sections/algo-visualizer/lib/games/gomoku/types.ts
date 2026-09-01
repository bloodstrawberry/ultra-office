export type GomokuColor = 'B' | 'W';

export type GomokuGrid = (GomokuColor | null)[][];

export interface GomokuPoint {
  r: number;
  c: number;
}

export interface GomokuWinLine {
  color: GomokuColor;
  points: GomokuPoint[];
}

export interface GomokuSolutionNode {
  move: GomokuPoint;
  comment?: string;
  isCorrect?: boolean;
  aiResponse?: GomokuPoint;
  aiComment?: string;
  children?: GomokuSolutionNode[];
}

export interface GomokuProblem {
  id: string;
  title: string;
  difficulty: '초급';
  category: '오목완성' | '열린4' | '4-3공격' | '3-3공격' | '수비';
  initialBlack: GomokuPoint[];
  initialWhite: GomokuPoint[];
  playerColor: GomokuColor;
  objective: string;
  hint: string;
  solutionTree: GomokuSolutionNode[];
  explanation: string;
  csConcept: string;
}

export interface GomokuAIAnalysis {
  evaluationScore: number;
  bestMove: GomokuPoint | null;
  recommendedMoves: { move: GomokuPoint; score: number; pattern: string }[];
  searchDepth: number;
  searchNodesEvaluated: number;
  timeMs: number;
}
