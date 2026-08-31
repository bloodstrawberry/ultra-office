export type StoneColor = 'B' | 'W';

export interface Point {
  r: number;
  c: number;
}

export type BoardGrid = (StoneColor | null)[][];

export interface StoneGroup {
  id: number;
  color: StoneColor;
  stones: Point[];
  liberties: Point[];
  libertyCount: number;
}

export interface BadukMoveResult {
  valid: boolean;
  error?: 'OCCUPIED' | 'SUICIDE' | 'KO' | 'OUT_OF_BOUNDS';
  captures: Point[];
  newBoard: BoardGrid;
  koPoint?: Point | null;
}

export interface BadukSolutionNode {
  move: Point; // where to play
  comment?: string;
  isCorrect?: boolean;
  aiResponse?: Point; // AI counter move if any
  aiComment?: string;
  children?: BadukSolutionNode[];
}

export interface BadukProblem {
  id: string;
  title: string;
  difficulty: '입문' | '초급' | '중급' | '고급';
  category: '사활' | '수상전' | '맥점' | '환격' | '귀삼수' | '축/장문';
  boardSize: number;
  focusRegion?: {
    minR: number;
    maxR: number;
    minC: number;
    maxC: number;
  };
  initialBlack: Point[];
  initialWhite: Point[];
  playerColor: StoneColor; // usually 'B'
  objective: string;
  hint: string;
  solutionTree: BadukSolutionNode[];
  explanation: string;
  csConcept: string;
}

export interface BadukAIAnalysis {
  libertiesMap: number[][]; // liberties for each stone position
  influenceMap: number[][]; // -1.0 (White dominance) to +1.0 (Black dominance)
  recommendedMoves: { point: Point; score: number; reason: string }[];
  searchNodesEvaluated: number;
  searchDepth: number;
  timeMs: number;
}
